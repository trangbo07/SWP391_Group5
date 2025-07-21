package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import dao.DoctorDAO;
import dao.DoctorScheduleDAO;
import dto.DoctorDTO;
import dto.DoctorScheduleDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;
@WebServlet("/api/doctor-schedule-upcoming")
public class DoctorSchedule7dayServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Lấy doctorId từ query string
        String doctorIdParam = request.getParameter("doctorId");

        if (doctorIdParam == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Thiếu doctorId");
            return;
        }

        int doctorId;
        try {
            doctorId = Integer.parseInt(doctorIdParam);
        } catch (NumberFormatException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "doctorId không hợp lệ");
            return;
        }


        // Gọi DAO
        DoctorScheduleDAO dao = new DoctorScheduleDAO();
        List<DoctorScheduleDTO> schedules = dao.getScheduleNext7Days(doctorId);
        System.out.println("doctorId: " + schedules);
        // Trả JSON
        response.setContentType("application/json");
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getWriter(), schedules);
    }
}
