package controller;


import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountPatient;
import dto.ExaminationPatientDTO;



import java.io.IOException;
import java.util.List;
import dao.ExaminationPatientDAO;

@WebServlet("/api/examination-results")
public class ExaminationPatientServlet extends HttpServlet {
    private ExaminationPatientDAO examinationResultDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        examinationResultDAO = new ExaminationPatientDAO();
        gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String patientIdParam = request.getParameter("patientId");
            if (patientIdParam == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\":\"Thiếu patientId\"}");
                return;
            }

            int patientId = Integer.parseInt(patientIdParam);

            // Gọi DAO để lấy kết quả khám bệnh
            List<ExaminationPatientDTO> results = examinationResultDAO.getExaminationResultsByPatientId(patientId);
            System.out.println(results);
            ApiResponse apiResponse = new ApiResponse(true, "Lấy kết quả khám bệnh thành công");
            apiResponse.setExaminationResults(results);
            response.getWriter().write(gson.toJson(apiResponse));

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(new ApiResponse(false, "Có lỗi xảy ra: " + e.getMessage())));
        }
    }

    // API Response class
    private static class ApiResponse {
        private boolean success;
        private String message;
        private List<ExaminationPatientDTO> examinationResults;

        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<ExaminationPatientDTO> getExaminationResults() { return examinationResults; }
        public void setExaminationResults(List<ExaminationPatientDTO> examinationResults) { this.examinationResults = examinationResults; }
    }
} 