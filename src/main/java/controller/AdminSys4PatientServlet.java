package controller;

import com.google.gson.Gson;
import dao.PatientDAOFA;
import dao.SystemLogStaffDAO;
import dto.JsonResponse;
import dto.PatientDTOFA;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountStaff;
import model.SystemLog_Staff;
import util.NormalizeUtil;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

@MultipartConfig(
        fileSizeThreshold = 1024 * 1024,
        maxFileSize = 5 * 1024 * 1024,
        maxRequestSize = 10 * 1024 * 1024
)
@WebServlet("/api/admin/patients")
public class AdminSys4PatientServlet extends HttpServlet {

    private final PatientDAOFA dao = new PatientDAOFA();
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
                case "" -> {
                    String accountId = req.getParameter("accountPatientId");
                    if (accountId == null) {
                        out.print(gson.toJson(new JsonResponse(false, "Thiếu accountPatientId")));
                        return;
                    }

                    String gender = req.getParameter("gender");
                    String search = NormalizeUtil.normalizeKeyword(req.getParameter("search"));

                    List<PatientDTOFA> list = dao.getPatientsByAccountIdFiltered(accountId.toString(), gender, search);
                    out.print(gson.toJson(list));
                }

                case "unlinked" -> {
                    String accIdParam = req.getParameter("accountPatientId");
                    String searchTerm = req.getParameter("search");
                    if (accIdParam == null) {
                        out.print(gson.toJson(new JsonResponse(false, "Thiếu accountPatientId")));
                        return;
                    }
                    List<PatientDTOFA> unlinked;

                    searchTerm = NormalizeUtil.normalizeKeyword(searchTerm);
                    unlinked = dao.getPatientsNotLinkedToAccount(Integer.parseInt(accIdParam), searchTerm);

                    out.print(gson.toJson(unlinked));
                }

                default -> {
                    out.print(gson.toJson(new JsonResponse(false, "Hành động không hợp lệ")));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print(gson.toJson(new JsonResponse(false, "Lỗi máy chủ")));
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
            if (action == null) {
                out.print(gson.toJson(new JsonResponse(false, "Hành động không hợp lệ")));
                return;
            }

            String patientId = req.getParameter("patientId");
            String fullName = req.getParameter("fullName");
            String dob = req.getParameter("dob");
            String gender = req.getParameter("gender");
            String phone = req.getParameter("phone");
            String address = req.getParameter("address");
            String accountPatientId = req.getParameter("accountPatientId");

            JsonResponse jsonRes;

            switch (action) {
                case "create" -> {
                    if (accountPatientId == null || fullName == null || dob == null) {
                        jsonRes = new JsonResponse(false, "Thiếu các trường bắt buộc");
                    } else {
                        boolean ok = dao.createPatient(fullName, dob, gender, phone, address, Integer.parseInt(accountPatientId));
                        jsonRes = new JsonResponse(ok, ok ? "Đã tạo bệnh nhân thành công!" : "Tạo bệnh nhân không thành công!");
                        SystemLog_Staff log = new SystemLog_Staff();
                        log.setAccount_staff_id(staff.getAccount_staff_id());
                        log.setAction("Nhân viên " + staff.getUsername() + " đã tạo bệnh nhân: " + fullName);
                        log.setAction_type("CREATE");
                        logDAO.insertLog(log);
                    }
                    out.print(gson.toJson(jsonRes));
                }

                case "update" -> {
                    if (patientId == null) {
                        jsonRes = new JsonResponse(false, "Thiếu patientId");
                    } else {
                        boolean ok = dao.updatePatient(Integer.parseInt(patientId), fullName, dob, gender, phone, address);
                        jsonRes = new JsonResponse(ok, ok ? "Đã cập nhật bệnh nhân thành công!" : "Cập nhật bệnh nhân không thành công!");
                        if (ok && staff != null) {
                            SystemLog_Staff log = new SystemLog_Staff();
                            log.setAccount_staff_id(staff.getAccount_staff_id());
                            log.setAction("Nhân viên " + staff.getUsername() + " đã cập nhật thông tin bệnh nhân ID: " + patientId);
                            log.setAction_type("UPDATE");
                            logDAO.insertLog(log);
                        }
                    }
                    out.print(gson.toJson(jsonRes));
                }

                case "link-multiple" -> {
                    String accIdStr = req.getParameter("accountPatientId");
                    String patientIdsStr = req.getParameter("patientIds");

                    if (accIdStr == null || patientIdsStr == null || accIdStr.isEmpty() || patientIdsStr.isEmpty()) {
                        out.print(gson.toJson(new JsonResponse(false, "Thiếu dữ liệu")));
                        return;
                    }

                    int accountId = Integer.parseInt(accIdStr);
                    String[] idParts = patientIdsStr.split(",");
                    List<Integer> patientIds = new ArrayList<>();
                    for (String id : idParts) {
                        try {
                            patientIds.add(Integer.parseInt(id));
                        } catch (NumberFormatException ignored) {
                        }
                    }

                    boolean ok = dao.linkPatientsToAccount(accountId, patientIds);
                    out.print(gson.toJson(new JsonResponse(ok, ok ? "Thêm thành công!" : "Thêm không thành công!")));

                    if (ok && staff != null) {
                        SystemLog_Staff log = new SystemLog_Staff();
                        log.setAccount_staff_id(staff.getAccount_staff_id());
                        log.setAction("Nhân viên " + staff.getUsername() + " đã liên kết các bệnh nhân " + patientIds + " với tài khoản bệnh nhân ID: " + accountId);
                        log.setAction_type("UPDATE");
                        logDAO.insertLog(log);
                    }
                }

                case "unlink" -> {
                    String patientIdStr = req.getParameter("patientId");
                    String accountIdStr = req.getParameter("accountPatientId");

                    if (patientIdStr == null || accountIdStr == null) {
                        out.print(gson.toJson(new JsonResponse(false, "Thiếu patientId hoặc accountPatientId")));
                        return;
                    }

                    int patient_Id = Integer.parseInt(patientIdStr);
                    int accountId = Integer.parseInt(accountIdStr);

                    boolean ok = dao.unlinkPatientFromAccount(patient_Id, accountId);

                    out.print(gson.toJson(new JsonResponse(ok, ok ? "Gỡ thành công" : "Gỡ thất bại")));

                    if (ok && staff != null) {
                        SystemLog_Staff log = new SystemLog_Staff();
                        log.setAccount_staff_id(staff.getAccount_staff_id());
                        log.setAction("Nhân viên " + staff.getUsername() + " đã gỡ liên kết bệnh nhân ID: " + patient_Id + " khỏi tài khoản bệnh nhân ID: " + accountId);
                        log.setAction_type("UPDATE");
                        logDAO.insertLog(log);
                    }
                }


                default -> {
                    jsonRes = new JsonResponse(false, "Hành động không xác định:" + action);
                    out.print(gson.toJson(jsonRes));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print(gson.toJson(new JsonResponse(false, "Lỗi máy chủ: " + e.getMessage())));
        }
    }
}
