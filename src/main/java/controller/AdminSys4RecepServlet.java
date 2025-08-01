package controller;

import com.google.gson.Gson;
import dao.AccountDAO;
import dao.AccountStaffDAO;
import dao.AdminSystemDAO;
import dao.SystemLogStaffDAO;
import dto.DistinctResponse;
import dto.JsonResponse;
import dto.ReceptionistDTOFA;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
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
@WebServlet("/api/admin/receptionists")
public class AdminSys4RecepServlet extends HttpServlet {

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
            JsonResponse res = new JsonResponse(false, "Trái phép", "/view/home.html");
            out.print(new Gson().toJson(res));
            return;
        }

        try {
            String action = req.getParameter("action");
            if (action == null) action = "";

            switch (action) {
                case "" -> { // Mặc định: lấy toàn bộ bác sĩ
                    List<ReceptionistDTOFA> receptionists = dao.getAllReceptionists();
                    out.print(gson.toJson(receptionists));
                }

                case "distinct" -> {
                    String field = req.getParameter("field");
                    List<String> values = dao.getDistinctValuesRecep(field);
                    DistinctResponse res = new DistinctResponse(field, values);
                    out.print(gson.toJson(res));
                }

                case "view" -> {
                    int id = Integer.parseInt(req.getParameter("id"));
                    ReceptionistDTOFA receptionist = dao.getReceptionistById(id);
                    out.print(gson.toJson(receptionist));
                }

                case "filter" -> {
                    String status = req.getParameter("status");
                    String search = NormalizeUtil.normalizeKeyword(req.getParameter("search"));

                    List<ReceptionistDTOFA> receptionists = dao.filterReceptionists(status, search);
                    out.print(gson.toJson(receptionists));
                }

                default -> {
                    JsonResponse res = new JsonResponse(false, "Hành động không xác định: " + action);
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
        Gson gson = new Gson();
        AccountDAO accountDAO = new AccountDAO();

        SystemLogStaffDAO logDAO = new SystemLogStaffDAO();
        AccountStaff currentStaff = (AccountStaff) req.getSession().getAttribute("user");

        try {
            String action = req.getParameter("action");

            String accountStaffId = req.getParameter("accountStaffId");
            String fullName = req.getParameter("fullName");
            String username = req.getParameter("username");
            String email = req.getParameter("email");
            String phone = req.getParameter("phone");
            String status = req.getParameter("status");
            String receptionistId = req.getParameter("receptionistId");

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

                if (accountDAO.checkAccount(email)) {
                    jsonRes = new JsonResponse(false, "Email đã tồn tại.");
                    out.print(gson.toJson(jsonRes));
                    return;
                }
                if (accountDAO.checkAccount(username)) {
                    jsonRes = new JsonResponse(false, "Tên đăng nhập đã tồn tại.");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                String generatedPassword = generateRandomPassword(8);
                boolean success = dao.insertReceptionist(
                        username, generatedPassword, email, imagePath, status,
                        fullName, phone
                );

                jsonRes = new JsonResponse(success, success ? "Tạo thành công!" : "Tạo không thành công!");
                out.print(gson.toJson(jsonRes));

                if (success && currentStaff != null) {
                    logStaffAction(logDAO, currentStaff, "Nhân viên " + currentStaff.getUsername() + " đã tạo lễ tân: " + username, "CREATE");
                }

                return;

            } else if ("update".equals(action)) {
                if (receptionistId == null || receptionistId.isEmpty()) {
                    jsonRes = new JsonResponse(false, "Thiếu ID");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
                AccountStaff acc = (AccountStaff) accountStaffDAO.getAccountStaffById(Integer.parseInt(accountStaffId));
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
                    jsonRes = new JsonResponse(false, "Tên đăng nhập hoặc Email đã tồn tại.");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                boolean success = dao.updateReceptionist(
                        Integer.parseInt(receptionistId), Integer.parseInt(accountStaffId),
                        username, email, imagePath, status, fullName, phone
                );

                jsonRes = new JsonResponse(success, success ? "Cập nhật thành công" : "Cập nhật không thành công");
                out.print(gson.toJson(jsonRes));

                if (success && currentStaff != null) {
                    logStaffAction(logDAO, currentStaff, "Nhân viên " + currentStaff.getUsername() + " đã cập nhật lễ tân ID: " + receptionistId, "UPDATE");
                }

                return;
            } else if ("updateStatus".equals(action)) {
                int account_staff_id = Integer.parseInt(req.getParameter("account_staff_id"));
                String newStatus = req.getParameter("status");

                boolean success = dao.updateAccountStaffStatus(account_staff_id, newStatus);
                jsonRes = new JsonResponse(success, success ? "Cập nhật thành công" : "Cập nhật không thành công");
                out.print(gson.toJson(jsonRes));

                if (success && currentStaff != null) {
                    logStaffAction(logDAO, currentStaff, "Nhân viên " + currentStaff.getUsername() + " đã cập nhật trạng thái lễ tân ID: " + account_staff_id + " thành: " + newStatus, "UPDATE");
                }

                return;
            } else if ("resetPassword".equals(action)) {
                String staffIdRaw = req.getParameter("accountStaffId");
                if (staffIdRaw == null || staffIdRaw.isEmpty()) {
                    jsonRes = new JsonResponse(false, "Thiếu accountStaffId");
                    out.print(gson.toJson(jsonRes));
                    return;
                }

                int staffId = Integer.parseInt(staffIdRaw);
                String generatedPassword = generateRandomPassword(8);
                boolean ok = accountDAO.resetStaffPassword(staffId, generatedPassword);

                jsonRes = new JsonResponse(ok, ok ? "Đặt lại mật khẩu thành công" : "Đặt lại mật khẩu không thành công");
                out.print(gson.toJson(jsonRes));

                if (ok && currentStaff != null) {
                    logStaffAction(logDAO, currentStaff, "Nhân viên " + currentStaff.getUsername() + " đã đặt lại mật khẩu cho lễ tân ID: " + staffId, "UPDATE");

                    AccountStaffDAO staffDAO = new AccountStaffDAO();
                    AccountStaff staff = staffDAO.getAccountStaffById(staffId);
                    if (staff != null && staff.getEmail() != null) {
                        String toEmail = staff.getEmail();
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
            JsonResponse errorRes = new JsonResponse(false, "Lỗi: " + e.getMessage());
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

    private void logStaffAction(SystemLogStaffDAO logDAO, AccountStaff staff, String action, String type) throws  Exception {
        if (staff == null) return;
        SystemLog_Staff log = new SystemLog_Staff();
        log.setAccount_staff_id(staff.getAccount_staff_id());
        log.setAction(action);
        log.setAction_type(type);
        logDAO.insertLog(log);
    }
}

