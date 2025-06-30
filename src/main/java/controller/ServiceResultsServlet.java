package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.ResultsOfParaclinicalServicesDAO;
import dao.WaitlistDAO;
import dao.ServiceOrderDAO;
import dao.AccountStaffDAO;
import dto.WaitlistDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountStaff;
import model.Doctor;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/doctor/service-results")
public class ServiceResultsServlet extends HttpServlet {

    private final WaitlistDAO waitlistDAO = new WaitlistDAO();
    private final ResultsOfParaclinicalServicesDAO resultsDAO = new ResultsOfParaclinicalServicesDAO();
    private final ServiceOrderDAO serviceOrderDAO = new ServiceOrderDAO();
    private final AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
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

            String action = request.getParameter("action");

            if ("getResultWaitlist".equals(action)) {
                // Lấy danh sách waitlist có visittype = "result"
                List<WaitlistDTO> resultWaitlist = waitlistDAO.getResultWaitlist();
                List<Map<String, Object>> waitlistWithProgress = new ArrayList<>();

                for (WaitlistDTO waitlist : resultWaitlist) {
                    Map<String, Object> waitlistInfo = new HashMap<>();
                    
                    // Copy thông tin waitlist
                    waitlistInfo.put("waitlist_id", waitlist.getWaitlist_id());
                    waitlistInfo.put("patient_id", waitlist.getPatient_id());
                    waitlistInfo.put("full_name", waitlist.getFull_name());
                    waitlistInfo.put("dob", waitlist.getDob());
                    waitlistInfo.put("gender", waitlist.getGender());
                    waitlistInfo.put("room_id", waitlist.getRoom_id());
                    waitlistInfo.put("registered_at", waitlist.getRegistered_at());
                    waitlistInfo.put("estimated_time", waitlist.getEstimated_time());
                    waitlistInfo.put("appointment_datetime", waitlist.getAppointment_datetime());
                    waitlistInfo.put("status", waitlist.getStatus());
                    waitlistInfo.put("visittype", waitlist.getVisittype());
                    waitlistInfo.put("note", waitlist.getNote());
                    waitlistInfo.put("shift", waitlist.getShift());
                    waitlistInfo.put("medicine_record_id", waitlist.getMedicine_record_id());

                    // Lấy thông tin progress kết quả xét nghiệm
                    if (waitlist.getMedicine_record_id() != 0) {
                        List<Map<String, Object>> detailedResults = resultsDAO.getDetailedResultsByMedicineRecordId(waitlist.getMedicine_record_id());
                        
                        // Tính tổng progress cho tất cả service orders
                        int totalServices = 0;
                        int completedServices = 0;
                        
                        Map<Integer, Map<String, Object>> serviceOrderProgress = new HashMap<>();
                        
                        for (Map<String, Object> result : detailedResults) {
                            int serviceOrderId = (int) result.get("service_order_id");
                            
                            if (!serviceOrderProgress.containsKey(serviceOrderId)) {
                                Map<String, Object> progress = resultsDAO.getResultProgressByServiceOrderId(serviceOrderId);
                                serviceOrderProgress.put(serviceOrderId, progress);
                                
                                totalServices += (int) progress.get("total_services");
                                completedServices += (int) progress.get("completed_services");
                            }
                        }
                        
                        double overallProgress = totalServices > 0 ? 
                            (double) completedServices / totalServices * 100 : 0;
                        
                        waitlistInfo.put("total_services", totalServices);
                        waitlistInfo.put("completed_services", completedServices);
                        waitlistInfo.put("progress_percentage", Math.round(overallProgress));
                        waitlistInfo.put("is_complete", completedServices == totalServices && totalServices > 0);
                        waitlistInfo.put("service_order_progress", serviceOrderProgress);
                        waitlistInfo.put("detailed_results", detailedResults);
                    } else {
                        waitlistInfo.put("total_services", 0);
                        waitlistInfo.put("completed_services", 0);
                        waitlistInfo.put("progress_percentage", 0);
                        waitlistInfo.put("is_complete", false);
                        waitlistInfo.put("service_order_progress", new HashMap<>());
                        waitlistInfo.put("detailed_results", new ArrayList<>());
                    }

                    waitlistWithProgress.add(waitlistInfo);
                }

                jsonResponse.put("success", true);
                jsonResponse.put("data", waitlistWithProgress);
                jsonResponse.put("message", "Result waitlist retrieved successfully");

            } else if ("getDetailedResults".equals(action)) {
                // Lấy chi tiết kết quả xét nghiệm theo medicine record ID hoặc service order ID
                String medicineRecordIdParam = request.getParameter("medicineRecordId");
                String serviceOrderIdParam = request.getParameter("serviceOrderId");
                
                List<Map<String, Object>> detailedResults;
                
                if (serviceOrderIdParam != null && !serviceOrderIdParam.trim().isEmpty()) {
                    // Nếu có serviceOrderId, lấy kết quả theo service order ID cụ thể
                    int serviceOrderId = Integer.parseInt(serviceOrderIdParam);
                    detailedResults = resultsDAO.getResultsByServiceOrderId(serviceOrderId);
                    jsonResponse.put("message", "Detailed results for service order retrieved successfully");
                } else if (medicineRecordIdParam != null && !medicineRecordIdParam.trim().isEmpty()) {
                    // Nếu chỉ có medicineRecordId, lấy tất cả kết quả của medicine record
                    int medicineRecordId = Integer.parseInt(medicineRecordIdParam);
                    detailedResults = resultsDAO.getDetailedResultsByMedicineRecordId(medicineRecordId);
                    jsonResponse.put("message", "Detailed results retrieved successfully");
                } else {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Medicine record ID or Service order ID is required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                jsonResponse.put("success", true);
                jsonResponse.put("data", detailedResults);

            } else if ("getResultProgress".equals(action)) {
                // Lấy progress theo service order ID
                String serviceOrderIdParam = request.getParameter("serviceOrderId");
                if (serviceOrderIdParam == null || serviceOrderIdParam.trim().isEmpty()) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Service order ID is required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                int serviceOrderId = Integer.parseInt(serviceOrderIdParam);
                Map<String, Object> progress = resultsDAO.getResultProgressByServiceOrderId(serviceOrderId);

                jsonResponse.put("success", true);
                jsonResponse.put("data", progress);
                jsonResponse.put("message", "Result progress retrieved successfully");

            } else {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Invalid action");
            }

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Internal server error: " + e.getMessage());
        }

        mapper.writeValue(response.getWriter(), jsonResponse);
    }

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
            String action = (String) requestData.get("action");

            if ("updateResult".equals(action)) {
                // Cập nhật kết quả xét nghiệm
                Integer serviceOrderItemId = (Integer) requestData.get("serviceOrderItemId");
                String resultDescription = (String) requestData.get("resultDescription");

                if (serviceOrderItemId == null || resultDescription == null || resultDescription.trim().isEmpty()) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Service order item ID and result description are required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                boolean success = resultsDAO.createOrUpdateResult(serviceOrderItemId, resultDescription.trim());

                if (success) {
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", "Result updated successfully");
                } else {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Failed to update result");
                }

            } else {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Invalid action");
            }

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Internal server error: " + e.getMessage());
        }

        mapper.writeValue(response.getWriter(), jsonResponse);
    }
} 