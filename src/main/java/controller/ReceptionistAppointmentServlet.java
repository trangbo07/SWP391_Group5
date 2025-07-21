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

@WebServlet("/api/receptionist/appointment")
public class ReceptionistAppointmentServlet extends HttpServlet {
    private final AppointmentDAO appointmentDAO = new AppointmentDAO();
    private final DoctorDAO doctorDAO = new DoctorDAO();
    private final PatientDAO patientDAO = new PatientDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

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

            if (appointmentRequest.action == null) {
                resp.setStatus(400);
                out.write("{\"error\":\"Missing action\"}");
                return;
            }

            String actionLower = appointmentRequest.action.toLowerCase();
            
            switch (actionLower) {
                case "create":
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
                    break;
                case "confirm":
                    // Xác nhận appointment và insert waitlist
                    if (appointmentRequest.appointmentId == 0) {
                        resp.setStatus(400);
                        out.write("{\"success\":false,\"message\":\"Missing appointmentId\"}");
                        break;
                    }
                    boolean updated = appointmentDAO.updateAppointmentStatus(appointmentRequest.appointmentId, "Confirmed");
                    if (!updated) {
                        resp.setStatus(500);
                        out.write("{\"success\":false,\"message\":\"Failed to update appointment status\"}");
                        break;
                    }
                    // Lấy thông tin appointment vừa xác nhận (sử dụng hàm mới đơn giản)
                    dto.AppointmentDTO app = appointmentDAO.getAppointmentBasicInfo(appointmentRequest.appointmentId);
                    if (app == null) {
                        resp.setStatus(500);
                        out.write("{\"success\":false,\"message\":\"Appointment not found\"}");
                        break;
                    }
                    // Insert waitlist (room_id = -1, status = Waiting, visittype = Initial, registered_at = now, estimated_time = app.appointment_datetime)
                    model.Waitlist waitlist = new model.Waitlist();
                    waitlist.setPatient_id(app.getPatient_id());
                    waitlist.setDoctor_id(app.getDoctor_id());
                    waitlist.setRoom_id(-1); // Chưa phân phòng - sử dụng -1 thay vì 0
                    waitlist.setStatus("Waiting");
                    waitlist.setVisittype("Initial");
                    
                    // Format datetime for SQL Server
                    String currentTime = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                    waitlist.setRegistered_at(currentTime);
                    waitlist.setEstimated_time(app.getAppointment_datetime());
                    
                    // Kiểm tra dữ liệu trước khi insert
                    if (app.getPatient_id() <= 0 || app.getDoctor_id() <= 0) {
                        resp.setStatus(500);
                        out.write("{\"success\":false,\"message\":\"Invalid appointment data\"}");
                        break;
                    }
                    
                    boolean inserted = new dao.WaitlistDAO().insertWaitlist(waitlist);
                    if (inserted) {
                        out.write("{\"success\":true,\"message\":\"Appointment confirmed and added to waitlist\"}");
                    } else {
                        resp.setStatus(500);
                        out.write("{\"success\":false,\"message\":\"Failed to insert waitlist\"}");
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
            e.printStackTrace();
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