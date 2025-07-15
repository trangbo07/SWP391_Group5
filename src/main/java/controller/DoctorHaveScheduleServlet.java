package controller;


import com.google.gson.Gson;
import dao.DoctorDAO;
import dto.DoctorDTO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;

    @WebServlet("/api/doctors/available")
    public class DoctorHaveScheduleServlet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
            List<DoctorDTO> doctors = DoctorDAO.getDoctorsWithUpcomingSchedule();
            System.out.println(doctors);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(new Gson().toJson(doctors));
        }
    }

