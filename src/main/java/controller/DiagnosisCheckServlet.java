package controller;

import dao.DiagnosisDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet("/api/diagnosis/check")
public class DiagnosisCheckServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Check session
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\"}");
            return;
        }

        // Get medicineRecordId parameter
        String medicineRecordIdParam = request.getParameter("medicineRecordId");
        
        if (medicineRecordIdParam == null || medicineRecordIdParam.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Missing medicineRecordId parameter\"}");
            return;
        }

        try {
            int medicineRecordId = Integer.parseInt(medicineRecordIdParam);
            
            DiagnosisDAO diagnosisDAO = new DiagnosisDAO();
            boolean exists = diagnosisDAO.existsDiagnosisByMedicineRecordId(medicineRecordId);
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            String result = "{\"exists\": " + exists + "}";
            response.getWriter().write(result);
            
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Invalid medicineRecordId format\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Database error\"}");
        }
    }
} 