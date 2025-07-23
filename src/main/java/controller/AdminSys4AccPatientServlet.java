package controller;

import com.google.gson.Gson;
import dao.AccountDAO;
import dao.AccountPatientDAOFA;
import dao.SystemLogPatientDAO;
import dao.SystemLogStaffDAO;
import dto.AccountPatientDTO;
import dto.DistinctResponse;
import dto.JsonResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountStaff;
import model.SystemLog_Patient;
import model.SystemLog_Staff;
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
            JsonResponse res = new JsonResponse(false, "Trái phép", "/view/home.html");
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
        SystemLogStaffDAO logDAO = new SystemLogStaffDAO();

        HttpSession session = req.getSession();
        AccountStaff staff = (AccountStaff) session.getAttribute("user");

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
                        jsonRes = new JsonResponse(false, "Email đã tồn tại.");
                        out.print(gson.toJson(jsonRes));
                        return;
                    }
                    if (accountDAO.checkAccount(username)) {
                        jsonRes = new JsonResponse(false, "Tên đăng nhập đã tồn tại.");
                        out.print(gson.toJson(jsonRes));
                        return;
                    }

                    String password = generateRandomPassword(8);
                    boolean ok = dao.insertAccountPatient(username, password, email, imagePath, status);
                    jsonRes = new JsonResponse(ok, ok ? "Tạo thành công!" : "Tạo không thành công!");
                    out.print(gson.toJson(jsonRes));

                    if (ok) {
                        SystemLog_Staff log = new SystemLog_Staff();
                        log.setAccount_staff_id(staff.getAccount_staff_id()); // Bạn cần hàm này trong DAO
                        log.setAction("Nhân viên " + staff.getUsername() + " đã tạo tài khoản cho bệnh nhân: " + username);

                        log.setAction_type("CREATE");
                        logDAO.insertLog(log);
                    }
                }

                case "update" -> {
                    if (accountPatientId == null || accountPatientId.isEmpty()) {
                        jsonRes = new JsonResponse(false, "Thiếu ID");
                        out.print(gson.toJson(jsonRes));
                        return;
                    }

                    AccountPatientDTO existing = dao.getAccountById(Integer.parseInt(accountPatientId));
                    if (existing == null) {
                        out.print(gson.toJson(new JsonResponse(false, "Không tìm thấy tài khoản")));
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
                        jsonRes = new JsonResponse(false, "Tên đăng nhập hoặc Email đã tồn tại.");
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
                    jsonRes = new JsonResponse(ok, ok ? "Cập nhật thành công" : "Cập nhật không thành công");
                    out.print(gson.toJson(jsonRes));

                    if (ok) {
                        SystemLog_Staff log = new SystemLog_Staff();
                        String actor = (staff != null) ? staff.getUsername() : "Unknown";

                        log.setAccount_staff_id(staff.getAccount_staff_id());
                        log.setAction("Nhân viên " + actor + " đã cập nhật tài khoản bệnh nhân: " + existing.getUsername());
                        log.setAction_type("UPDATE");

                        logDAO.insertLog(log);
                    }

                }

                case "updateStatus" -> {
                    int id = Integer.parseInt(req.getParameter("account_patient_id"));
                    String newStatus = req.getParameter("status");
                    boolean ok = dao.updateStatus(id, newStatus);
                    jsonRes = new JsonResponse(ok, ok ? "Cập nhật thành công" : "Cập nhật không thành công");
                    out.print(gson.toJson(jsonRes));

                    if (ok) {
                        AccountPatientDTO target = dao.getAccountById(id); // Lấy username bệnh nhân

                        SystemLog_Staff log = new SystemLog_Staff();
                        log.setAccount_staff_id(staff.getAccount_staff_id());
                        log.setAction("Nhân viên " + staff.getUsername() + " đã cập nhật trạng thái của tài khoản bệnh nhân: " + target.getUsername() + " thành " + newStatus);
                        log.setAction_type("UPDATE");

                        logDAO.insertLog(log);
                    }
                }

                case "resetPassword" -> {
                    int id = Integer.parseInt(req.getParameter("accountPatientId"));
                    String newPass = generateRandomPassword(8);
                    boolean ok = dao.resetPatientPassword(id, newPass);
                    jsonRes = new JsonResponse(ok, ok ? "Đặt lại mật khẩu thành công" : "Đặt lại mật khẩu không thành công");
                    out.print(gson.toJson(jsonRes));

                    if (ok) {
                        AccountPatientDTO target = dao.getAccountById(id); // Lấy username bệnh nhân

                        SystemLog_Staff log = new SystemLog_Staff();
                        log.setAccount_staff_id(staff.getAccount_staff_id());
                        log.setAction("Nhân viên " + staff.getUsername() + " đã đặt lại mật khẩu cho bệnh nhân: " + target.getUsername());
                        log.setAction_type("UPDATE");

                        logDAO.insertLog(log);
                    }
                }

                default -> {
                    jsonRes = new JsonResponse(false, "Hành động không hợp lệ");
                    out.print(gson.toJson(jsonRes));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print(gson.toJson(new JsonResponse(false, "Lỗi máy chủ: " + e.getMessage())));
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
