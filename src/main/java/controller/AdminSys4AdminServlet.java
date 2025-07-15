package controller;

import com.google.gson.Gson;
import dao.AccountDAO;
import dao.AccountStaffDAO;
import dao.AdminSystemDAO;
import dto.AdminDTOFA;
import dto.DistinctResponse;
import dto.JsonResponse;
import dto.ReceptionistDTOFA;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
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
@WebServlet("/api/admin/admins")
public class AdminSys4AdminServlet extends HttpServlet {

    private final AdminSystemDAO dao = new AdminSystemDAO();
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
            out.print(new Gson().toJson(res));
            return;
        }

        try {
            String action = req.getParameter("action");
            if (action == null) action = "";

            AdminSystemDAO dao = new AdminSystemDAO();
            Gson gson = new Gson();

            switch (action) {
                case "" -> { // Lấy toàn bộ admin (từ bảng UNION)
                    List<AdminDTOFA> admins = dao.getAllAdmins();
                    out.print(gson.toJson(admins));
                }

                case "distinct" -> {
                    String field = req.getParameter("field");
                    String role = req.getParameter("role");

                    List<String> values = dao.getDistinctValuesAdmin(field);
                    DistinctResponse res = new DistinctResponse(field, values);
                    out.print(gson.toJson(res));
                }

                case "view" -> {
                    int id = Integer.parseInt(req.getParameter("id"));
                    AdminDTOFA admin = dao.getAdminById(id);
                    out.print(gson.toJson(admin));
                }

                case "filter" -> {
                    String status = req.getParameter("status");
                    String role = req.getParameter("role");
                    String department = req.getParameter("department");
                    String search = NormalizeUtil.normalizeKeyword(req.getParameter("search"));
                    List<AdminDTOFA> admins = dao.filterAdmins(status, role, department, search);
                    out.print(gson.toJson(admins));
                }

                default -> {
                    JsonResponse res = new JsonResponse(false, "Unknown action: " + action);
                    out.print(gson.toJson(res));
                }
            }

            out.flush();
        } catch (NumberFormatException e) {
            JsonResponse res = new JsonResponse(false, "Invalid ID format");
            out.print(new Gson().toJson(res));
        } catch (Exception e) {
            e.printStackTrace();
            JsonResponse res = new JsonResponse(false, "Server error");
            out.print(new Gson().toJson(res));
        }
    }


    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        Gson gson = new Gson();

        AccountDAO accountDAO = new AccountDAO();
        AdminSystemDAO dao = new AdminSystemDAO();

        try {
            String action = req.getParameter("action");

            String accountStaffId = req.getParameter("accountStaffId");
            String adminId = req.getParameter("adminId");
            String fullName = req.getParameter("fullName");
            String username = req.getParameter("username");
            String email = req.getParameter("email");
            String phone = req.getParameter("phone");
            String status = req.getParameter("status");
            String role = req.getParameter("role"); // cần để phân biệt bảng
            String department = req.getParameter("department");

            JsonResponse jsonRes;
            String imagePath = "/assets/images/uploads/default.jpg";

            if ("create".equals(action)) {
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

                if (new AccountDAO().checkAccount(email)) {
                    jsonRes = new JsonResponse(false, "Email already exists.");
                    out.print(gson.toJson(jsonRes));
                    return;
                }
                if (new AccountDAO().checkAccount(username)) {
                    jsonRes = new JsonResponse(false, "Username already exists.");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                String generatedPassword = generateRandomPassword(8);
                boolean success = dao.insertAdmin(username, generatedPassword, email, imagePath, status,
                                                    fullName, phone, department, role);

                jsonRes = new JsonResponse(success, success ? "Create successfully!" : "Create failed!");
                out.print(gson.toJson(jsonRes));
                return;

            } else if ("update".equals(action)) {
                if (adminId == null || adminId.isEmpty()) {
                    jsonRes = new JsonResponse(false, "Missing admin ID");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                int adminIdInt = Integer.parseInt(adminId);
                int accountStaffIdInt = Integer.parseInt(accountStaffId);

                AccountStaff acc = new AccountStaffDAO().getAccountStaffById(accountStaffIdInt);
                if (acc == null) {
                    jsonRes = new JsonResponse(false, "Account not found");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                String oldUsername = acc.getUsername();
                String oldEmail = acc.getEmail();
                String oldImagePath = acc.getImg();

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

                boolean success = dao.updateAdmin(
                        adminIdInt, accountStaffIdInt,
                        username, email, imagePath, status, role,
                        fullName, phone, department
                );

                jsonRes = new JsonResponse(success, success ? "Updated successfully!" : "Update failed!");
                out.print(gson.toJson(jsonRes));
                return;
            } else if ("updateStatus".equals(action)) {
                int account_staff_id = Integer.parseInt(req.getParameter("account_staff_id"));
                String newStatus = req.getParameter("status");

                boolean success = dao.updateAccountStaffStatus(account_staff_id, newStatus);
                jsonRes = new JsonResponse(success, success ? "Status updated!" : "Status update failed.");
                out.print(gson.toJson(jsonRes));
                return;

            } else if ("resetPassword".equals(action)) {
                String staffIdRaw = req.getParameter("accountStaffId");
                if (staffIdRaw == null || staffIdRaw.isEmpty()) {
                    jsonRes = new JsonResponse(false, "Missing accountStaffId");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                int staffId = Integer.parseInt(staffIdRaw);
                String generatedPassword = generateRandomPassword(8);
                boolean ok = accountDAO.resetStaffPassword(staffId, generatedPassword);

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
            out.print(new Gson().toJson(errorRes));
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

