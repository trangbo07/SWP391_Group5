package controller;

import com.google.gson.Gson;
import dao.AccountDAO;
import dao.AccountPatientDAOFA;
import dto.AccountPatientDTO;
import dto.DistinctResponse;
import dto.JsonResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import util.ImageCheckUtil;
import util.NormalizeUtil;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Paths;
import java.util.List;
import java.util.Random;

@MultipartConfig(
        fileSizeThreshold = 1024 * 1024,
        maxFileSize = 5 * 1024 * 1024,
        maxRequestSize = 10 * 1024 * 1024
)
@WebServlet("/api/admin/accountpatients")
public class AdminSys4AccPatientServlet extends HttpServlet {

    private final AccountPatientDAOFA dao = new AccountPatientDAOFA();
    private final AccountDAO accountDAO = new AccountDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            JsonResponse res = new JsonResponse(false, "Unauthorized", "/view/home.html");
            out.print(gson.toJson(res));
            return;
        }

        try {
            String action = req.getParameter("action");
            if (action == null) action = "";

            switch (action) {
                case "" -> {
                    List<AccountPatientDTO> list = dao.getAllAccounts();
                    out.print(gson.toJson(list));
                }

                case "distinct" -> {
                    String field = req.getParameter("field");
                    List<String> values = dao.getDistinctValues(field);
                    DistinctResponse res = new DistinctResponse(field, values);
                    out.print(gson.toJson(res));
                }

                case "view" -> {
                    int id = Integer.parseInt(req.getParameter("id"));
                    AccountPatientDTO dto = dao.getAccountById(id);
                    out.print(gson.toJson(dto));
                }

                case "filter" -> {
                    String status = req.getParameter("status");
                    String search = NormalizeUtil.normalizeKeyword(req.getParameter("search"));
                    List<AccountPatientDTO> filtered = dao.filterAccountPatients(status, search);
                    out.print(gson.toJson(filtered));
                }

                default -> {
                    JsonResponse res = new JsonResponse(false, "Unknown action: " + action);
                    out.print(gson.toJson(res));
                }
            }

            out.flush();
        } catch (NumberFormatException e) {
            JsonResponse res = new JsonResponse(false, "Invalid ID format");
            out.print(gson.toJson(res));
        } catch (Exception e) {
            e.printStackTrace();
            JsonResponse res = new JsonResponse(false, "Server error");
            out.print(gson.toJson(res));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            String action = req.getParameter("action");
            String accountPatientId = req.getParameter("accountPatientId");
            String username = req.getParameter("username");
            String email = req.getParameter("email");
            String status = req.getParameter("status");

            JsonResponse jsonRes;
            String imagePath = "/assets/images/uploads/default.jpg";

            switch (action) {
                case "create" -> {
                    Part imgPart = req.getPart("img");

                    if (imgPart != null && imgPart.getSize() > 0) {

                        if (!ImageCheckUtil.isMimeAndSizeValid(imgPart) ||
                                !ImageCheckUtil.isActualImage(imgPart)) {

                            JsonResponse res = new JsonResponse(false,
                                    "Ảnh không hợp lệ.");
                            out.print(gson.toJson(res));
                            return;
                        }

                        String originalName = Paths.get(imgPart.getSubmittedFileName())
                                .getFileName().toString();
                        String ext = originalName.contains(".")
                                ? originalName.substring(originalName.lastIndexOf('.'))
                                : "";
                        String fileName = java.util.UUID.randomUUID() + ext;

                        String uploadDirPath = getServletContext()
                                .getRealPath("/assets/images/uploads");
                        File uploadDir = new File(uploadDirPath);
                        if (!uploadDir.exists()) uploadDir.mkdirs();

                        String savedFilePath = uploadDirPath + File.separator + fileName;
                        imgPart.write(savedFilePath);

                        imagePath = "/assets/images/uploads/" + fileName;               // path lưu DB
                    }


                    if (accountDAO.checkAccount(email)) {
                        jsonRes = new JsonResponse(false, "Email already exists.");
                        out.print(gson.toJson(jsonRes));
                        return;
                    }
                    if (accountDAO.checkAccount(username)) {
                        jsonRes = new JsonResponse(false, "Username already exists.");
                        out.print(gson.toJson(jsonRes));
                        return;
                    }

                    String password = generateRandomPassword(8);
                    boolean ok = dao.insertAccountPatient(username, password, email, imagePath, status);
                    jsonRes = new JsonResponse(ok, ok ? "Create successfully!" : "Create failed!");
                    out.print(gson.toJson(jsonRes));
                }

                case "update" -> {
                    if (accountPatientId == null || accountPatientId.isEmpty()) {
                        jsonRes = new JsonResponse(false, "Missing ID");
                        out.print(gson.toJson(jsonRes));
                        return;
                    }

                    AccountPatientDTO existing = dao.getAccountById(Integer.parseInt(accountPatientId));
                    if (existing == null) {
                        out.print(gson.toJson(new JsonResponse(false, "Account not found")));
                        return;
                    }

                    String oldUsername = existing.getUsername();
                    String oldEmail = existing.getEmail();
                    String oldImagePath = existing.getImg();

                    Part imgPart = req.getPart("img");

                    if (imgPart != null && imgPart.getSize() > 0) {

                        if (!ImageCheckUtil.isMimeAndSizeValid(imgPart) ||
                                !ImageCheckUtil.isActualImage(imgPart)) {

                            JsonResponse res = new JsonResponse(false,
                                    "Ảnh không hợp lệ.");
                            out.print(gson.toJson(res));
                            return;
                        }

                        String originalName = Paths.get(imgPart.getSubmittedFileName())
                                .getFileName().toString();
                        String ext = originalName.contains(".")
                                ? originalName.substring(originalName.lastIndexOf('.'))
                                : "";
                        String fileName = java.util.UUID.randomUUID() + ext;           // tránh trùng tên

                        String uploadDirPath = getServletContext()
                                .getRealPath("/assets/images/uploads");
                        File uploadDir = new File(uploadDirPath);
                        if (!uploadDir.exists()) uploadDir.mkdirs();

                        String savedFilePath = uploadDirPath + File.separator + fileName;
                        imgPart.write(savedFilePath);

                        imagePath = "/assets/images/uploads/" + fileName;               // path lưu DB
                    } else {
                        imagePath = oldImagePath;
                    }

                    boolean duplicated = dao.isEmailOrUsernameDuplicated(username, email, oldUsername, oldEmail);
                    if (duplicated) {
                        jsonRes = new JsonResponse(false, "Username or Email already exists.");
                        out.print(gson.toJson(jsonRes));
                        return;
                    }

                    // Nếu không có ảnh mới thì giữ ảnh cũ
                    if (imgPart == null || imgPart.getSize() == 0) {
                        imagePath = existing.getImg();
                    }

                    boolean ok = dao.updateAccountPatient(
                            Integer.parseInt(accountPatientId),
                            username, email, imagePath, status
                    );
                    jsonRes = new JsonResponse(ok, ok ? "Update successful" : "Update failed");
                    out.print(gson.toJson(jsonRes));
                }

                case "updateStatus" -> {
                    int id = Integer.parseInt(req.getParameter("account_patient_id"));
                    String newStatus = req.getParameter("status");
                    boolean ok = dao.updateStatus(id, newStatus);
                    jsonRes = new JsonResponse(ok, ok ? "Status updated!" : "Update failed");
                    out.print(gson.toJson(jsonRes));
                }

                case "resetPassword" -> {
                    int id = Integer.parseInt(req.getParameter("accountPatientId"));
                    String newPass = generateRandomPassword(8);
                    boolean ok = dao.resetPatientPassword(id, newPass);
                    jsonRes = new JsonResponse(ok, ok ? "Reset successful" : "Reset failed");
                    out.print(gson.toJson(jsonRes));
                }

                default -> {
                    jsonRes = new JsonResponse(false, "Invalid action");
                    out.print(gson.toJson(jsonRes));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print(gson.toJson(new JsonResponse(false, "Server error: " + e.getMessage())));
        }
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
