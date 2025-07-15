package controller;

import com.google.gson.Gson;
import dao.AccountDAO;
import dao.AccountStaffDAO;
import dao.AdminSystemDAO;
import dto.DistinctResponse;
import dto.JsonResponse;
import dto.PharmacistDTOFA;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountPharmacist;
import model.AccountStaff;
import util.ImageCheckUtil;
import util.NormalizeUtil;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Paths;
import java.util.List;
import java.util.Random;

@MultipartConfig(
        fileSizeThreshold = 1024 * 1024,  // 1MB
        maxFileSize = 5 * 1024 * 1024,    // 5MB
        maxRequestSize = 10 * 1024 * 1024 // 10MB
)
@WebServlet("/api/admin/pharmacists")
public class AdminSys4PharmacistServlet extends HttpServlet {

    private final AdminSystemDAO dao = new AdminSystemDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            String action = req.getParameter("action");
            if (action == null) action = "";

            switch (action) {
                case "" -> { // Lấy toàn bộ dược sĩ
                    List<PharmacistDTOFA> pharmacists = dao.getAllPharmacists();
                    out.print(gson.toJson(pharmacists));
                }

                case "distinct" -> { // Trả về danh sách giá trị riêng biệt theo field
                    String field = req.getParameter("field");
                    List<String> values = dao.getDistinctValuesPharmacist(field);
                    DistinctResponse res = new DistinctResponse(field, values);
                    out.print(gson.toJson(res));
                }

                case "view" -> { // Xem chi tiết 1 dược sĩ
                    int id = Integer.parseInt(req.getParameter("id"));
                    PharmacistDTOFA pharmacist = dao.getPharmacistById(id);
                    out.print(gson.toJson(pharmacist));
                }

                case "filter" -> { // Lọc dược sĩ theo status, eduLevel, search
                    String status = req.getParameter("status");
                    String eduLevel = req.getParameter("eduLevel");
                    String search = NormalizeUtil.normalizeKeyword(req.getParameter("search"));

                    List<PharmacistDTOFA> pharmacists = dao.filterPharmacists(status, eduLevel, search);
                    out.print(gson.toJson(pharmacists));
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
        AccountDAO accountDAO = new AccountDAO();

        try {
            String action = req.getParameter("action");
            JsonResponse jsonRes;
            String imagePath = "/assets/images/uploads/default.jpg";
            if ("create".equals(action)) {
                String username = req.getParameter("username");
                String email = req.getParameter("email");
                String fullName = req.getParameter("fullName");
                String phone = req.getParameter("phone");
                String eduLevel = req.getParameter("eduLevel");
                String status = req.getParameter("status");
                System.out.println(username);
                System.out.println(email);

                // 1. Check duplicate
                if (accountDAO.checkAccount(email)) {
                    out.print(gson.toJson(new JsonResponse(false, "Email already exists.")));
                    return;
                }
                if (accountDAO.checkAccount(username)) {
                    out.print(gson.toJson(new JsonResponse(false, "Username already exists.")));
                    return;
                }

                // 2. Save image
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
                }

                // 3. Insert
                boolean success = dao.insertPharmacist(username, generateRandomPassword(8), email, imagePath, status, fullName, phone, eduLevel);
                jsonRes = new JsonResponse(success, success ? "Created pharmacist successfully." : "Creation failed.");
                out.print(gson.toJson(jsonRes));
                return;
            } else if ("update".equals(action)) {
                int pharmacistId = Integer.parseInt(req.getParameter("pharmacistId"));
                int accountPharmacistId = Integer.parseInt(req.getParameter("accountPharmacistId"));
                String username = req.getParameter("username");
                String email = req.getParameter("email");
                String fullName = req.getParameter("fullName");
                String phone = req.getParameter("phone");
                String eduLevel = req.getParameter("eduLevel");
                String status = req.getParameter("status");

                AccountPharmacist acc = dao.getAccountPharmacistById(pharmacistId);
                if (acc == null) {
                    jsonRes = new JsonResponse(false, "Account not found");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                String oldUsername = acc.getUsername();
                String oldEmail = acc.getEmail();
                String oldImagePath = acc.getImg();

                // 1. Save image if updated
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

                boolean isDuplicate = dao.isEmailOrUsernameDuplicated(username, email, oldUsername, oldEmail);
                if (isDuplicate) {
                    jsonRes = new JsonResponse(false, "Username or Email already exists.");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                boolean updated = dao.updatePharmacist(pharmacistId, accountPharmacistId, username, email, imagePath, status, fullName, phone, eduLevel);
                jsonRes = new JsonResponse(updated, updated ? "Updated successfully!" : "Update failed!");
                out.print(gson.toJson(jsonRes));
                return;
            } else if ("updateStatus".equals(action)) {
                int accountPharmacistId = Integer.parseInt(req.getParameter("accountPharmacistId"));
                String newStatus = req.getParameter("status");

                boolean success = dao.updateAccountPharmacistStatus(accountPharmacistId , newStatus); // viết hàm này trong DAO
                jsonRes = new JsonResponse(success, success ? "Status updated!" : "Status update failed.");
                out.print(gson.toJson(jsonRes));
                return;
            } else if ("resetPassword".equals(action)) {
                String accountPharmacistId = req.getParameter("accountPharmacistId");
                if (accountPharmacistId == null || accountPharmacistId.isEmpty()) {
                    jsonRes = new JsonResponse(false, "Missing accountPharmacistId");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                int pharmacistId = Integer.parseInt(accountPharmacistId);
                String generatedPassword = generateRandomPassword(8);
                boolean ok = accountDAO.resetPharmacistPassword(pharmacistId, generatedPassword);
                jsonRes = new JsonResponse(ok, ok ? "Reset password successfully" : "Reset password failed");
                out.print(gson.toJson(jsonRes));
                return;
            } else {
                jsonRes = new JsonResponse(false, "Invalid action");
                out.print(gson.toJson(jsonRes));
            }

        } catch (Exception e) {
            e.printStackTrace();
            JsonResponse errorRes = new JsonResponse(false, "Error: " + e.getMessage());
            out.print(gson.toJson(errorRes));
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
