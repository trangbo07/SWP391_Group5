package controller;

import com.google.gson.Gson;
import dao.*;
import dto.DistinctResponse;
import dto.JsonResponse;
import dto.PharmacistDTOFA;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountPharmacist;
import model.AccountStaff;
import model.SystemLog_Staff;
import util.EmailService;
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
            JsonResponse res = new JsonResponse(false, "Định dạng ID không hợp lệ");
            out.print(gson.toJson(res));
        } catch (Exception e) {
            e.printStackTrace();
            JsonResponse res = new JsonResponse(false, "Lỗi máy chủ");
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

        SystemLogStaffDAO logDAO = new SystemLogStaffDAO();
        AccountStaff staff = (AccountStaff) req.getSession().getAttribute("user");

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
                jsonRes = new JsonResponse(success, success ? "Tạo thành công!" : "Tạo không thành công!");
                out.print(gson.toJson(jsonRes));

                if (success && staff != null) {
                    logStaffAction(logDAO, staff, "Nhân viên " + staff.getUsername() + " đã tạo tài khoản dược sĩ: " + username, "CREATE");
                }

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
                    out.print(gson.toJson(new JsonResponse(false, "Không tìm thấy tài khoản")));
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
                    jsonRes = new JsonResponse(false, "Tên đăng nhập hoặc Email đã tồn tại.");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                boolean updated = dao.updatePharmacist(pharmacistId, accountPharmacistId, username, email, imagePath, status, fullName, phone, eduLevel);
                jsonRes = new JsonResponse(updated, updated ? "Cập nhật thành công" : "Cập nhật không thành công");
                out.print(gson.toJson(jsonRes));

                if (updated && staff != null) {
                    logStaffAction(logDAO, staff, "Nhân viên " + staff.getUsername() + " đã cập nhật tài khoản dược sĩ ID: " + pharmacistId, "UPDATE");
                }

                return;
            } else if ("updateStatus".equals(action)) {
                int accountPharmacistId = Integer.parseInt(req.getParameter("accountPharmacistId"));
                String newStatus = req.getParameter("status");

                boolean success = dao.updateAccountPharmacistStatus(accountPharmacistId , newStatus); // viết hàm này trong DAO
                jsonRes = new JsonResponse(success, success ? "Cập nhật thành công" : "Cập nhật không thành công");
                out.print(gson.toJson(jsonRes));

                if (success && staff != null) {
                    logStaffAction(logDAO, staff, "Nhân viên " + staff.getUsername() + " đã cập nhật trạng thái tài khoản dược sĩ ID: " + accountPharmacistId + " thành: " + newStatus, "UPDATE");
                }

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
                jsonRes = new JsonResponse(ok, ok ? "Đặt lại mật khẩu thành công" : "Đặt lại mật khẩu không thành công");
                out.print(gson.toJson(jsonRes));

                if (ok && staff != null) {
                    logStaffAction(logDAO, staff, "Nhân viên " + staff.getUsername() + " đã đặt lại mật khẩu tài khoản dược sĩ ID: " + pharmacistId, "UPDATE");

                    AccountPharmacistDAO accountPharmacistDAO  =  new AccountPharmacistDAO();
                    AccountPharmacist pharmacist = accountPharmacistDAO.getAccountByPharmacistId(pharmacistId);
                    if (pharmacist != null && pharmacist.getEmail() != null) {
                        String toEmail = pharmacist.getEmail();
                        String subject = "Your password has been reset";
                        String content = EmailService.generateNewPasswordEmailContent(generatedPassword);

                        try {
                            EmailService.sendEmail(toEmail, subject, content); // Hàm gửi mail có định dạng HTML
                        } catch (Exception e) {
                            System.err.println("Gửi email thất bại: " + e.getMessage());
                        }
                    }
                }

                return;
            } else {
                jsonRes = new JsonResponse(false, "Hành động không hợp lệ");
                out.print(gson.toJson(jsonRes));
            }

        } catch (Exception e) {
            e.printStackTrace();
            JsonResponse errorRes = new JsonResponse(false, "Error: " + e.getMessage());
            out.print(gson.toJson(errorRes));
        }
    }

    private void logStaffAction(SystemLogStaffDAO logDAO, AccountStaff staff, String action, String type) throws Exception {
        if (staff == null) return;
        SystemLog_Staff log = new SystemLog_Staff();
        log.setAccount_staff_id(staff.getAccount_staff_id());
        log.setAction(action);
        log.setAction_type(type);
        logDAO.insertLog(log);
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
