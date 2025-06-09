package controller;

import dao.AppointmentDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Appointment;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "AppointmentServlet", urlPatterns = {"/appointment"})
public class AppointmentServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pid = request.getParameter("patientId");

        if (pid == null || pid.trim().isEmpty()) {
            response.sendRedirect("view/error.html?message=Missing+patientId");
            return;
        }

        try {
            int patientId = Integer.parseInt(pid);

            List<Appointment> appointments = AppointmentDAO.getAppointmentsByPatientId(patientId);

            if (appointments == null || appointments.isEmpty()) {
                request.setAttribute("message", "Không có cuộc hẹn nào cho bệnh nhân ID: " + patientId);
            } else {
                request.setAttribute("appointments", appointments);
                request.setAttribute("patientId", patientId);
            }

            request.getRequestDispatcher("view/appointment.html").forward(request, response);

        } catch (NumberFormatException e) {
            response.sendRedirect("view/error.html?message=Invalid+patientId");
        }
    }
}
