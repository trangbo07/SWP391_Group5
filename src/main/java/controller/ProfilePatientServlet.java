package controller;

import com.google.gson.Gson;
import dao.ProfilePatientDAO;

import dto.PatientDTO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountPatient;


import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/patient/profile")
public class ProfilePatientServlet extends HttpServlet {

    private final Gson gson = new Gson();
    private final ProfilePatientDAO patientDAO = new ProfilePatientDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Not logged in\"}");
            return;
        }


        AccountPatient user = (AccountPatient) session.getAttribute("user");
        int accountPatientId = user.getAccount_patient_id();
        System.out.println("[DEBUG] account_patient_id = " + accountPatientId);


        List<PatientDTO> patientDetails ;




        PrintWriter out = response.getWriter();
        out.print(gson.toJson("patientDetails"));
        out.flush();
    }
}


