package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.DoctorScheduleDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/check-doctor-schedule") // <-- Định nghĩa đường dẫn API
public class DoctorScheduleServlet extends HttpServlet {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        int doctorId = Integer.parseInt(request.getParameter("doctorId"));
        String workingDate = request.getParameter("workingDate");
        String shift = request.getParameter("shift");

        DoctorScheduleDAO dao = new DoctorScheduleDAO();
        boolean exists = dao.checkScheduleExists(doctorId, workingDate, shift);

        // Chuẩn bị JSON phản hồi
        Map<String, Boolean> result = new HashMap<>();
        result.put("exists", exists);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        mapper.writeValue(response.getWriter(), result);
    }
}
