package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import dao.AppoinmentPatientDAO;
import dto.PatientBookAppoinmentDTO;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@WebServlet("/api/book-appointment")
public class BookAppointmentServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final AppoinmentPatientDAO appointmentDAO = new AppoinmentPatientDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        JsonObject jsonResponse = new JsonObject();

        try {
            BufferedReader reader = req.getReader();
            JsonObject jsonRequest = gson.fromJson(reader, JsonObject.class);
            System.out.println("[DEBUG] JSON Request: " + jsonRequest); // In ra JSON nhận được

            // Kiểm tra các trường bắt buộc
            if (jsonRequest == null ||
                    !jsonRequest.has("doctorId") ||
                    !jsonRequest.has("patientId") ||
                    !jsonRequest.has("workingDate") ||
                    !jsonRequest.has("timeSlot") ||
                    !jsonRequest.has("shift")) {

                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("message", "Thiếu dữ liệu bắt buộc. Vui lòng kiểm tra đầu vào.");
                out.print(gson.toJson(jsonResponse));
                return;
            }

            // Lấy dữ liệu từ JSON
            int doctorId = jsonRequest.get("doctorId").getAsInt();
            int patientId = jsonRequest.get("patientId").getAsInt();
            String workingDate = jsonRequest.get("workingDate").getAsString(); // yyyy-MM-dd
            String timeSlot = jsonRequest.get("timeSlot").getAsString();       // HH:mm
            String shift = jsonRequest.get("shift").getAsString();
            String note = jsonRequest.has("note") ? jsonRequest.get("note").getAsString() : "";

            // Ghép thành LocalDateTime
            String fullDateTimeStr = workingDate + " " + timeSlot;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            LocalDateTime localDateTime = LocalDateTime.parse(fullDateTimeStr, formatter);
            Timestamp appointmentDatetime = Timestamp.valueOf(localDateTime);

            // Tạo DTO
            PatientBookAppoinmentDTO appointment = new PatientBookAppoinmentDTO();
            appointment.setDoctorId(doctorId);
            appointment.setPatientId(patientId);
            appointment.setAppointmentDatetime(appointmentDatetime);
            appointment.setReceptionistId(1); // TODO: lấy từ session nếu cần
            appointment.setShift(shift);
            appointment.setNote(note);
            appointment.setStatus("Pending");

            // Gọi DAO
            boolean inserted = appointmentDAO.insertAppointment(appointment);

            if (inserted) {
                jsonResponse.addProperty("success", true);
                jsonResponse.addProperty("message", "Đặt lịch thành công.");
            } else {
                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("message", "Không thể đặt lịch. Vui lòng thử lại.");
                System.err.println("[ERROR] Insert failed: " + appointment);
            }

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Lỗi hệ thống: " + e.getMessage());
            System.err.println("[EXCEPTION] Đặt lịch lỗi: " + e.getMessage());
        }

        out.print(gson.toJson(jsonResponse));
        out.flush();
    }
}
