package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.PatientDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountPatient;
import model.Patient;

import java.io.BufferedReader;
import java.io.IOException;


@WebServlet("/create-patient")
public class CreatePatientServlet extends HttpServlet {
    private final PatientDAO patientDAO = new PatientDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        HttpSession session = request.getSession();
        AccountPatient account = (AccountPatient) session.getAttribute("user");

        if (account == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("{\"error\": \"Chưa đăng nhập\"}");
            return;
        }

        int accountPatientId = account.getAccount_patient_id(); // ✅ đã là int, không cần parse
        // Đọc JSON từ body request
        StringBuilder jsonBuilder = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            jsonBuilder.append(line);
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            Patient patient = mapper.readValue(jsonBuilder.toString(), Patient.class);

            int id = patientDAO.insertPatient(patient);
            patientDAO.linkPatientToAccount(id,accountPatientId);
            response.getWriter().write("{\"success\": true, \"id\": " + id + "}");
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("{\"success\": false, \"message\": \"Lỗi thêm bệnh nhân\"}");
        }
    }
}

