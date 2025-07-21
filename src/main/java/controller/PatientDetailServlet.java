package controller;

import com.google.gson.Gson;
import dao.AccountPatientDAO;
import dao.ProfilePatientDAO;
import dto.PatientDTO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import model.AccountPatient;

@WebServlet("/api/patient/detail") // <-- Bổ sung dòng này
public class PatientDetailServlet extends HttpServlet {

    private final Gson gson = new Gson();
    private final ProfilePatientDAO accountPatientDAO = new ProfilePatientDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String idStr = request.getParameter("patientId");
        if (idStr == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Missing patientId\"}");
            return;
        }

        int patientId;
        try {
            patientId = Integer.parseInt(idStr);
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Invalid patientId\"}");
            return;
        }
        ProfilePatientDAO profilePatientDAO = new ProfilePatientDAO();
        PatientDTO patient = profilePatientDAO.getPatientById(patientId);
        System.out.println(patient);
        if (patient == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().write("{\"error\":\"Patient not found\"}");
            return;
        }

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(patient));
        out.flush();
    }
}
