package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.AccountStaffDAO;
import dao.ServiceResultDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountStaff;
import model.Doctor;
import model.ServiceResult;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/doctor/service-result")
public class DoctorServiceResultServlet extends HttpServlet {

    private final ServiceResultDAO serviceResultDAO = new ServiceResultDAO();
    private final AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> jsonResponse = new HashMap<>();

        try {
            // Kiểm tra session và quyền bác sĩ
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Unauthorized access");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            AccountStaff accountStaff = (AccountStaff) session.getAttribute("user");
            if (!"Doctor".equals(accountStaff.getRole())) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Access denied. Doctor role required.");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Đọc dữ liệu từ request
            Map<String, Object> requestData = mapper.readValue(request.getReader(), Map.class);

            // Lấy thông tin từ request
            Integer serviceOrderItemId = (Integer) requestData.get("serviceOrderItemId");
            String testResults = (String) requestData.get("testResults");
            String conclusion = (String) requestData.get("conclusion");
            String resultStatus = (String) requestData.get("resultStatus");

            // Validation
            if (serviceOrderItemId == null || testResults == null) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Missing required fields");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            if (testResults.trim().isEmpty()) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Test results cannot be empty");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Tạo result description từ test results, conclusion và status
            StringBuilder resultDescription = new StringBuilder();
            resultDescription.append("Test Results: ").append(testResults.trim());

            if (conclusion != null && !conclusion.trim().isEmpty()) {
                resultDescription.append("\n\nConclusion: ").append(conclusion.trim());
            }

            if (resultStatus != null && !resultStatus.trim().isEmpty()) {
                resultDescription.append("\n\nStatus: ").append(resultStatus.trim());
            }

            // Kiểm tra xem đã có kết quả cho service order item này chưa
            ServiceResult existingResult = serviceResultDAO.getServiceResultByServiceOrderItemId(serviceOrderItemId);

            boolean success;
            if (existingResult != null) {
                // Cập nhật kết quả hiện có
                existingResult.setResult_description(resultDescription.toString());
                success = serviceResultDAO.updateServiceResult(existingResult);
            } else {
                // Tạo kết quả mới
                ServiceResult newResult = new ServiceResult();
                newResult.setService_order_item_id(serviceOrderItemId);
                newResult.setResult_description(resultDescription.toString());
                success = serviceResultDAO.createServiceResult(newResult);
            }

            if (success) {
                jsonResponse.put("success", true);
                jsonResponse.put("message", "Test results saved successfully");
            } else {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Failed to save test results");
            }

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Internal server error: " + e.getMessage());
        }

        mapper.writeValue(response.getWriter(), jsonResponse);
    }
} 