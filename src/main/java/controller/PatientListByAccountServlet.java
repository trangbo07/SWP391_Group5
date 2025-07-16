package controller;

import com.google.gson.Gson;
import dao.PatientAccountDAO;
import dao.PatientDAO;
import dto.PatientDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.Patient;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/patient/list-by-account")
public class PatientListByAccountServlet extends HttpServlet {

    private final PatientAccountDAO patientDAO = new PatientAccountDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String accountIdParam = request.getParameter("accountId");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try (PrintWriter out = response.getWriter()) {
            if (accountIdParam == null || accountIdParam.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"Thiếu accountId\"}");
                return;
            }

            int accountId = Integer.parseInt(accountIdParam);
            List<Patient> patients = patientDAO.getPatientsByAccountId(accountId);
            System.out.println(patients);
            String json = new Gson().toJson(patients);
            out.print(json);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        }
    }
}
