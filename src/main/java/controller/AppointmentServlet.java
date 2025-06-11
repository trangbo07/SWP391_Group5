package controller;

<<<<<<< HEAD
import dao.AppointmentDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Appointment;
=======
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Appointment;
import dao.AppointmentDAO;
>>>>>>> fce8356 (List Appointment)

import java.io.IOException;
import java.util.List;

@WebServlet(name = "AppointmentServlet", urlPatterns = {"/appointment"})
<<<<<<< HEAD
public class AppointmentServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pid = request.getParameter("patientId");
=======
@MultipartConfig
public class AppointmentServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pid = request.getParameter("patient_id");
>>>>>>> fce8356 (List Appointment)

        if (pid == null || pid.trim().isEmpty()) {
            response.sendRedirect("view/error.html?message=Missing+patientId");
            return;
        }

        try {
            int patientId = Integer.parseInt(pid);

<<<<<<< HEAD
            List<Appointment> appointments = AppointmentDAO.getAppointmentsByPatientId(patientId);
=======
            List<Appointment> appointments = AppointmentDAO.getAppointmentsByPatientID(patientId);
>>>>>>> fce8356 (List Appointment)

            if (appointments == null || appointments.isEmpty()) {
                request.setAttribute("message", "Không có cuộc hẹn nào cho bệnh nhân ID: " + patientId);
            } else {
                request.setAttribute("appointments", appointments);
                request.setAttribute("patientId", patientId);
            }

<<<<<<< HEAD
            request.getRequestDispatcher("view/appointment.html").forward(request, response);
=======
            request.getRequestDispatcher("view/patient/appointment.html").forward(request, response);
>>>>>>> fce8356 (List Appointment)

        } catch (NumberFormatException e) {
            response.sendRedirect("view/error.html?message=Invalid+patientId");
        }
    }
<<<<<<< HEAD
=======

>>>>>>> fce8356 (List Appointment)
}
