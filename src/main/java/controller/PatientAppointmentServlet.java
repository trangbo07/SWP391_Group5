package controller;

import com.google.gson.Gson;
import dao.FeedbackDAO;
import dto.AppointmentpatientDTO;
import dao.PatientAppointmentDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet("/api/patient/appointment")
public class PatientAppointmentServlet extends HttpServlet {
    private final PatientAppointmentDAO dao = new PatientAppointmentDAO();
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
            int patientId = ((model.AccountPatient) session.getAttribute("user"))
                    .getAccount_patient_id();

            String action  = req.getParameter("action");
            String idParam = req.getParameter("id");

            // detail
            if ("detail".equalsIgnoreCase(action) && idParam != null) {
                int apptId = Integer.parseInt(idParam);
                AppointmentpatientDTO appointment = dao.getAppointmentDetailById(apptId, patientId);
                    
                if (appointment == null) {
                    resp.setStatus(404);
                    out.write("{\"error\":\"Appointment not found\"}");
                } else {
                    out.write(gson.toJson(appointment));
                }
                return;
            }

            // cancel
            if ("cancel".equalsIgnoreCase(action) && idParam != null) {
                int apptId = Integer.parseInt(idParam);
                boolean ok = dao.cancelAppointmentById(apptId, patientId);
                out.write(gson.toJson(Map.of("success", ok)));
                return;
            }

            // default GET: Pending list
            List<AppointmentpatientDTO> list = dao.getByPatientAndStatus(patientId, "Pending");
            out.write(gson.toJson(list));
            
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
            int patientId = ((model.AccountPatient) session.getAttribute("user"))
                    .getAccount_patient_id();

            // đọc body JSON
            String body = req.getReader().lines().collect(Collectors.joining());
            String action = gson.fromJson(body, RequestAction.class).action;

            String status;
            switch (action) {
                case "Completed": status = "Completed"; break;
                case "Cancelled": status = "Cancelled"; break;
                default:          status = "Pending";   break;
            }

            List<AppointmentpatientDTO> list = dao.getByPatientAndStatus(patientId, status);
            out.write(gson.toJson(list));
            
        } catch (Exception e) {
            resp.setStatus(500);
            out.write("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }

    private static class RequestAction {
        String action;
    }

}
