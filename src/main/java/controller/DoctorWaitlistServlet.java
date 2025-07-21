package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import dao.AccountStaffDAO;
import dao.AppointmentDAO;
import dao.WaitlistDAO;
import dto.AppointmentDTO;
import dto.WaitlistDTO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountStaff;
import model.Doctor;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet("/api/doctor/waitlist")
public class DoctorWaitlistServlet extends HttpServlet {

    private final AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
    private final WaitlistDAO waitlistDAO = new WaitlistDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("user") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\"}");
            return;
        }

        AccountStaff user = (AccountStaff) session.getAttribute("user");
        Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(user.getAccount_staff_id(), user.getRole());

        if (doctor == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Doctor not found\"}");
            return;
        }

        String action = request.getParameter("action");
        String idParam = request.getParameter("id");

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        // 1. Trả danh sách waitlist của bác sĩ
        if ("waitlist".equalsIgnoreCase(action)) {
            List<WaitlistDTO> waitlist = waitlistDAO.getDoctorWaitlist(doctor.getDoctor_id());
            out.print(gson.toJson(waitlist));
            out.flush();
            return;
        }

        // 2. Trả thông tin chi tiết 1 bệnh nhân trong waitlist
        if ("detail".equalsIgnoreCase(action) && idParam != null) {
            try {
                int waitlistId = Integer.parseInt(idParam);
                WaitlistDTO waitlistDetail = waitlistDAO.getWaitlistDetailById(waitlistId);

                if (waitlistDetail == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"error\":\"Patient not found in waitlist.\"}");
                    return;
                }

                out.print(gson.toJson(waitlistDetail));
                out.flush();
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"Invalid waitlist ID.\"}");
            }
            return;
        }

        // 3. Nếu không phải action hợp lệ
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        out.write("{\"error\":\"Invalid action\"}");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("user") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\"}");
            return;
        }

        AccountStaff user = (AccountStaff) session.getAttribute("user");
        Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(user.getAccount_staff_id(), user.getRole());

        if (doctor == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Doctor not found\"}");
            return;
        }

    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Test endpoint - trả về thông tin cơ bản để verify connection
        String testParam = request.getParameter("test");
        if ("ping".equals(testParam)) {
            response.getWriter().write("{\"status\":\"success\",\"message\":\"PUT endpoint is working\",\"timestamp\":\"" + new java.util.Date() + "\"}");
            return;
        }
        
        try {
            BufferedReader reader = request.getReader();
            String requestBody = reader.lines().collect(Collectors.joining());
            
            // Kiểm tra nếu request body rỗng
            if (requestBody == null || requestBody.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\":\"Request body is empty\"}");
                return;
            }
            
            JsonObject jsonBody = JsonParser.parseString(requestBody).getAsJsonObject();

            if (!jsonBody.has("waitlistId")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\":\"Missing waitlistId\"}");
                return;
            }

            int waitlistId = jsonBody.get("waitlistId").getAsInt();
            
            boolean updated = false;
            String message = "";

            // Kiểm tra xem có cả status và visittype không
            if (jsonBody.has("status") && jsonBody.has("visittype")) {
                // Cập nhật cả status và visittype
                String status = jsonBody.get("status").getAsString();
                String visittype = jsonBody.get("visittype").getAsString();

                updated = waitlistDAO.updateStatusAndVisittype(waitlistId, status, visittype);
                message = updated ? "Status and visittype updated successfully" : "Failed to update status and visittype";

            } else if (jsonBody.has("status")) {
                // Chỉ cập nhật status
                String status = jsonBody.get("status").getAsString();
                
                updated = waitlistDAO.updateStatus(waitlistId, status);
                message = updated ? "Status updated successfully" : "Failed to update status";

            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\":\"Missing status or visittype\"}");
                return;
            }

            if (updated) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"success\":true,\"message\":\"" + message + "\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\"}");
            }

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

}