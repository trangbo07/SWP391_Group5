package controller;

import com.google.gson.Gson;

import dao.DiagnosisPatientDAO;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import model.DiagnosisDetails;
import model.DiagnosisPatient;

import java.io.IOException;

import java.util.List;

@WebServlet("/DiagnosisServlet")
public class DiagnosisServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String idParam = request.getParameter("patientId");
            System.out.println("📥 patientId param = " + idParam);
            if (idParam == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\":\"Missing patientId\"}");
                return;
            }

            int patientId = Integer.parseInt(idParam);
            System.out.println("p = " + patientId);
            DiagnosisPatientDAO dao = new DiagnosisPatientDAO();
            List<DiagnosisPatient> list = dao.getDiagnosisByAccountIdAndName(patientId);

            System.out.println("🧾 Diagnosis list size = " + (list == null ? "null" : list.size()));
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            Gson gson = new Gson();
            String json = gson.toJson(list);
            System.out.println("📦 JSON trả về = " + json);
            response.getWriter().write(json);

        } catch (Exception e) {
            e.printStackTrace(); // ✅ Xem lỗi thực tế ở console
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Server error: " + e.getMessage() + "\"}");
        }
    }
}