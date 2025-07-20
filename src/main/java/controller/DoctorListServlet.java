package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.DoctorDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import dto.DoctorDTO;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet({"/api/doctors", "/api/doctors/departments", "/api/doctor-details"})
public class DoctorListServlet extends HttpServlet {
    private final DoctorDAO doctorDAO = new DoctorDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getServletPath();
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        if ("/api/doctors/departments".equals(path)) {
            List<String> departments = doctorDAO.getAllDepartments();
            mapper.writeValue(resp.getWriter(), departments);
        } else if ("/api/doctor-details".equals(path)) {
            String doctorId = req.getParameter("id");
            if (doctorId != null && !doctorId.trim().isEmpty()) {
                try {
                    int id = Integer.parseInt(doctorId);
                    DoctorDTO doctor = doctorDAO.getDoctorDTOById(id);
                    System.out.println("co anh chua" + doctor);
                    if (doctor != null) {
                        mapper.writeValue(resp.getWriter(), doctor);
                    } else {
                        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        mapper.writeValue(resp.getWriter(), Map.of("error", "Doctor not found"));
                    }
                } catch (NumberFormatException e) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    mapper.writeValue(resp.getWriter(), Map.of("error", "Invalid doctor ID"));
                }
            } else {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                mapper.writeValue(resp.getWriter(), Map.of("error", "Doctor ID is required"));
            }
        } else {
            List<DoctorDTO> list = doctorDAO.getAllDoctorDTOs();
            mapper.writeValue(resp.getWriter(), list);
        }
    }
}