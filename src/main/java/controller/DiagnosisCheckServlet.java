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
        System.out.println("[DEBUG] DiagnosisCheckServlet doGet called");
        System.out.println("[DEBUG] Request URL: " + request.getRequestURL());
        System.out.println("[DEBUG] Query string: " + request.getQueryString());
        
        // Check session
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\"}");
            return;
        }

        // Get medicineRecordId parameter
        String medicineRecordIdParam = request.getParameter("medicineRecordId");
        System.out.println("[DEBUG] medicineRecordIdParam: " + medicineRecordIdParam);
        
        if (medicineRecordIdParam == null || medicineRecordIdParam.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Missing medicineRecordId parameter\"}");
            return;
        }

        try {
            int medicineRecordId = Integer.parseInt(medicineRecordIdParam);
            System.out.println("[DEBUG] Parsed medicineRecordId: " + medicineRecordId);
            
            DiagnosisDAO diagnosisDAO = new DiagnosisDAO();
            boolean exists = diagnosisDAO.existsDiagnosisByMedicineRecordId(medicineRecordId);
            
            System.out.println("[DEBUG] Diagnosis exists for " + medicineRecordId + ": " + exists);
            
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            String result = "{\"exists\": " + exists + "}";
            System.out.println("[DEBUG] Sending response: " + result);
            response.getWriter().write(result);
            
        } catch (NumberFormatException e) {
            System.out.println("[ERROR] Invalid medicineRecordId format: " + medicineRecordIdParam);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Invalid medicineRecordId format\"}");
        } catch (Exception e) {
            System.out.println("[ERROR] Exception checking diagnosis: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Database error\"}");
        }
    }
} 