package controller;

import com.google.gson.Gson;
import dao.AppointmentDAO;
import dao.DoctorDAO;
import dao.PatientDAO;
import dto.DoctorDTO;
import model.Patient;
import model.AccountStaff;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@WebServlet({"/api/receptionist/appointment", "/api/receptionist/doctors", "/api/receptionist/appointmentslots"})
public class ReceptionistAppointmentServlet extends HttpServlet {
    private final AppointmentDAO appointmentDAO = new AppointmentDAO();
    private final DoctorDAO doctorDAO = new DoctorDAO();
    private final PatientDAO patientDAO = new PatientDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        String servletPath = req.getServletPath();
        if ("/api/receptionist/doctors".equals(servletPath)) {
            List<dto.DoctorDTO> doctors = doctorDAO.getAllDoctorDTOs();
            out.write(gson.toJson(doctors));
            return;
        }
        // Bổ sung API lấy slot đã đặt
        if ("/api/receptionist/appointmentslots".equals(servletPath)) {
            String doctorIdStr = req.getParameter("doctor_id");
            String date = req.getParameter("date"); // yyyy-MM-dd
            String shift = req.getParameter("shift"); // Morning/Afternoon/Evening
            if (doctorIdStr == null || date == null || shift == null) {
                resp.setStatus(400);
                out.write("{\"error\":\"Missing params\"}");
                return;
            }
            int doctorId = Integer.parseInt(doctorIdStr);
            List<String> slots = appointmentDAO.getBookedSlots(doctorId, date, shift);
            out.write(gson.toJson(slots));
            return;
        }

        try {
            HttpSession session = req.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                resp.setStatus(401);
                out.write("{\"error\":\"Not logged in\"}");
                return;
            }

            String action = req.getParameter("action");

            switch (action != null ? action : "") {
                case "doctors":
                    List<DoctorDTO> doctors = doctorDAO.getAllDoctorDTOs();
                    out.write(gson.toJson(doctors));
                    break;
                case "patients":
                    String keyword = req.getParameter("keyword");
                    if (keyword != null && !keyword.trim().isEmpty()) {
                        List<Map<String, Object>> patients = patientDAO.searchPatients(keyword);
                        out.write(gson.toJson(patients));
                    } else {
                        List<Patient> allPatients = patientDAO.getAllPatients();
                        out.write(gson.toJson(allPatients));
                    }
                    break;
                case "getAllAppointments":
                    List<dto.AppointmentDTO> appointments = appointmentDAO.getAllAppointmentsWithDetails();
                    if (appointments != null) {
                        out.write(gson.toJson(appointments));
                    } else {
                        out.write("[]");
                    }
                    break;
                default:
                    resp.setStatus(400);
                    out.write("{\"error\":\"Invalid action\"}");
                    break;
            }

        } catch (Exception e) {
            resp.setStatus(500);
            out.write("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            HttpSession session = req.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                resp.setStatus(401);
                out.write("{\"error\":\"Not logged in\"}");
                return;
            }

            AccountStaff user = (AccountStaff) session.getAttribute("user");
            int receptionistId = user.getAccount_staff_id();

            // Read JSON body
            String body = req.getReader().lines().collect(Collectors.joining());
            AppointmentRequest appointmentRequest = gson.fromJson(body, AppointmentRequest.class);

            // Xử lý xác nhận appointment (confirm) - làm lại rõ ràng
            if ("confirm".equals(appointmentRequest.action)) {
                System.out.println("DEBUG: Confirm action called with appointmentId = " + appointmentRequest.appointmentId);

                boolean updateSuccess = appointmentDAO.updateAppointmentStatus(appointmentRequest.appointmentId, "Confirmed");
                System.out.println("DEBUG: updateAppointmentStatus result = " + updateSuccess);

                if (!updateSuccess) {
                    resp.setStatus(500);
                    out.write("{\"success\":false,\"message\":\"Không thể xác nhận lịch hẹn!\"}");
                    return;
                }

                dto.AppointmentDTO appt = appointmentDAO.getAppointmentDetailWithAppointmentById(appointmentRequest.appointmentId);
                System.out.println("DEBUG: AppointmentDTO = " + gson.toJson(appt));

                if (appt == null) {
                    resp.setStatus(500);
                    out.write("{\"success\":false,\"message\":\"Không tìm thấy thông tin lịch hẹn!\"}");
                    return;
                }

                String shiftEn = convertShiftToEnglish(appt.getShift());
                String estimatedStr = appt.getAppointment_datetime();
                if (estimatedStr != null && estimatedStr.length() > 19) estimatedStr = estimatedStr.substring(0,19);

                model.Waitlist waitlist = new model.Waitlist();
                waitlist.setPatient_id(appt.getPatient_id());
                waitlist.setDoctor_id(appt.getDoctor_id());
                waitlist.setRoom_id(5); // Phòng mặc định
                waitlist.setStatus("Waiting");
                waitlist.setVisittype("Initial");
                waitlist.setRegistered_at(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                waitlist.setEstimated_time(estimatedStr);
                // Nếu waitlist có trường shift, thêm: waitlist.setShift(shiftEn);

                System.out.println("DEBUG: Waitlist to insert = " + gson.toJson(waitlist));

                try {
                    boolean waitlistSuccess = new dao.WaitlistDAO().insertWaitlist(waitlist);
                    System.out.println("DEBUG: Waitlist insert result = " + waitlistSuccess);
                    if (waitlistSuccess) {
                        out.write("{\"success\":true,\"message\":\"Đã xác nhận và chuyển vào danh sách chờ!\"}");
                    } else {
                        resp.setStatus(500);
                        out.write("{\"success\":false,\"message\":\"Xác nhận thành công nhưng thêm vào danh sách chờ thất bại!\"}");
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                    System.out.println("DEBUG: Exception message = " + ex.getMessage());
                    resp.setStatus(500);
                    out.write("{\"success\":false,\"message\":\"Lỗi khi thêm vào waitlist: " + ex.getMessage() + "\"}");
                }
                return;
            }

            // Xử lý cập nhật chi tiết lịch hẹn (edit)
            if ("edit".equals(appointmentRequest.action)) {
                boolean success = appointmentDAO.updateAppointment(
                    appointmentRequest.appointmentId,
                    appointmentRequest.doctorId,
                    appointmentRequest.patientId,
                    appointmentRequest.appointmentDateTime,
                    appointmentRequest.shift,
                    appointmentRequest.note != null ? appointmentRequest.note : ""
                );
                if (success) {
                    out.write("{\"success\":true,\"message\":\"Cập nhật lịch hẹn thành công\"}");
                } else {
                    resp.setStatus(500);
                    out.write("{\"success\":false,\"message\":\"Cập nhật lịch hẹn thất bại\"}");
                }
                return;
            }

            // Xử lý hủy lịch hẹn (cancel)
            if ("cancel".equals(appointmentRequest.action)) {
                boolean success = appointmentDAO.cancelAppointmentById(appointmentRequest.appointmentId);
                if (success) {
                    out.write("{\"success\":true,\"message\":\"Hủy lịch hẹn thành công\"}");
                } else {
                    resp.setStatus(500);
                    out.write("{\"success\":false,\"message\":\"Hủy lịch hẹn thất bại\"}");
                }
                return;
            }

            // Không cần action, chỉ nhận dữ liệu tạo appointment
            // Bổ sung kiểm tra trùng slot
            String datePart = null, timePart = null;
            if (appointmentRequest.appointmentDateTime != null && appointmentRequest.appointmentDateTime.length() >= 16) {
                datePart = appointmentRequest.appointmentDateTime.substring(0, 10); // yyyy-MM-dd
                timePart = appointmentRequest.appointmentDateTime.substring(11, 16); // HH:mm
            }
            if (datePart != null && timePart != null) {
                boolean slotBooked = appointmentDAO.isSlotBooked(
                    appointmentRequest.doctorId,
                    datePart,
                    appointmentRequest.shift,
                    timePart
                );
                if (slotBooked) {
                    resp.setStatus(409);
                    out.write("{\"success\":false,\"message\":\"Slot này đã có người đặt!\"}");
                    return;
                }
            }
            boolean success = appointmentDAO.createAppointment(
                appointmentRequest.doctorId,
                appointmentRequest.patientId,
                receptionistId,
                appointmentRequest.appointmentDateTime,
                appointmentRequest.shift,
                appointmentRequest.note != null ? appointmentRequest.note : ""
            );

            if (success) {
                out.write("{\"success\":true,\"message\":\"Appointment created successfully\"}");
            } else {
                resp.setStatus(500);
                out.write("{\"success\":false,\"message\":\"Failed to create appointment\"}");
            }
        } catch (Exception e) {
            resp.setStatus(500);
            out.write("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }

    // Chuyển shift tiếng Việt sang tiếng Anh
    private String convertShiftToEnglish(String shiftVi) {
        switch (shiftVi) {
            case "Sáng": return "Morning";
            case "Chiều": return "Afternoon";
            case "Tối": return "Evening";
            default: return shiftVi;
        }
    }

    private static class AppointmentRequest {
        String action;
        int doctorId;
        int patientId;
        String appointmentDateTime;
        String shift;
        String note;
        int appointmentId; // Thêm trường này để nhận appointmentId khi confirm
    }
} 