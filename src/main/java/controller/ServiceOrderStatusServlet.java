package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.AccountStaffDAO;
import dao.ServiceOrderDAO;
import dao.WaitlistDAO;
import dto.WaitlistDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountStaff;
import model.Doctor;
import model.ServiceOrder;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/service-order/status")
public class ServiceOrderStatusServlet extends HttpServlet {

    private final AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
    private final WaitlistDAO waitlistDAO = new WaitlistDAO();
    private final ServiceOrderDAO serviceOrderDAO = new ServiceOrderDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> jsonResponse = new HashMap<>();

        try {
            // Authentication check
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

            // Read request data
            Map<String, Object> requestData = mapper.readValue(request.getReader(), Map.class);

            // Extract parameters
            Object serviceOrderIdObj = requestData.get("serviceOrderId");
            Object waitlistIdObj = requestData.get("waitlistId");
            String status = (String) requestData.get("status");
            String visittype = (String) requestData.get("visittype");

            // Validation
            if (serviceOrderIdObj == null) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Missing serviceOrderId");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            if (status == null && visittype == null) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "At least one of status or visittype must be provided");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Convert serviceOrderId
            int serviceOrderId;
            try {
                if (serviceOrderIdObj instanceof Integer) {
                    serviceOrderId = (Integer) serviceOrderIdObj;
                } else {
                    serviceOrderId = Integer.parseInt(serviceOrderIdObj.toString());
                }
            } catch (NumberFormatException e) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Invalid serviceOrderId format");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Verify service order exists
            ServiceOrder serviceOrder = serviceOrderDAO.getServiceOrderById(serviceOrderId);
            if (serviceOrder == null) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Service order not found");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Authorization check
            Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
            if (doctor == null || doctor.getDoctor_id() != serviceOrder.getDoctor_id()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Access denied. You can only update status for your own service orders.");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            boolean waitlistUpdated = false;
            String updateMessage = "";

            // Update waitlist if waitlistId provided
            if (waitlistIdObj != null) {
                try {
                    int waitlistId;
                    if (waitlistIdObj instanceof Integer) {
                        waitlistId = (Integer) waitlistIdObj;
                    } else {
                        waitlistId = Integer.parseInt(waitlistIdObj.toString());
                    }

                    // Update both status and visittype
                    if (status != null && visittype != null) {
                        waitlistUpdated = waitlistDAO.updateStatusAndVisittype(waitlistId, status, visittype);
                        updateMessage = waitlistUpdated ? 
                            String.format("Status updated to '%s' and visittype updated to '%s'", status, visittype) :
                            "Failed to update waitlist status and visittype";
                    }
                    // Update only status
                    else if (status != null) {
                        waitlistUpdated = waitlistDAO.updateStatus(waitlistId, status);
                        updateMessage = waitlistUpdated ? 
                            String.format("Status updated to '%s'", status) :
                            "Failed to update waitlist status";
                    }
                    // Update only visittype
                    else if (visittype != null) {
                        WaitlistDTO currentWaitlist = waitlistDAO.getWaitlistDetailById(waitlistId);
                        if (currentWaitlist != null) {
                            waitlistUpdated = waitlistDAO.updateStatusAndVisittype(waitlistId, currentWaitlist.getStatus(), visittype);
                            updateMessage = waitlistUpdated ? 
                                String.format("Visittype updated to '%s'", visittype) :
                                "Failed to update waitlist visittype";
                        } else {
                            updateMessage = "Waitlist not found";
                        }
                    }

                } catch (NumberFormatException e) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Invalid waitlistId format");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }
            } else {
                waitlistUpdated = true;
                updateMessage = "Service order status confirmed (no waitlist to update)";
            }

            // Send response
            if (waitlistUpdated) {
                response.setStatus(HttpServletResponse.SC_OK);
                jsonResponse.put("success", true);
                jsonResponse.put("message", updateMessage);
                jsonResponse.put("serviceOrderId", serviceOrderId);
                if (waitlistIdObj != null) {
                    jsonResponse.put("waitlistId", waitlistIdObj);
                }
                if (status != null) {
                    jsonResponse.put("updatedStatus", status);
                }
                if (visittype != null) {
                    jsonResponse.put("updatedVisittype", visittype);
                }
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                jsonResponse.put("success", false);
                jsonResponse.put("message", updateMessage);
                jsonResponse.put("serviceOrderId", serviceOrderId);
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Internal server error: " + e.getMessage());
        }

        mapper.writeValue(response.getWriter(), jsonResponse);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, Object> apiInfo = new HashMap<>();
        apiInfo.put("endpoint", "/api/service-order/status");
        apiInfo.put("method", "POST");
        apiInfo.put("description", "Update waitlist status and visittype after service order creation");
        apiInfo.put("requiredFields", new String[]{"serviceOrderId"});
        apiInfo.put("optionalFields", new String[]{"waitlistId", "status", "visittype"});
        
        Map<String, Object> examples = new HashMap<>();
        examples.put("updateBothStatusAndVisittype", Map.of(
            "serviceOrderId", 123,
            "waitlistId", 456,
            "status", "Result",
            "visittype", "Waiting"
        ));
        examples.put("updateOnlyStatus", Map.of(
            "serviceOrderId", 123,
            "waitlistId", 456,
            "status", "Completed"
        ));
        examples.put("updateOnlyVisittype", Map.of(
            "serviceOrderId", 123,
            "waitlistId", 456,
            "visittype", "Follow-up"
        ));
        apiInfo.put("examples", examples);
        
        mapper.writeValue(response.getWriter(), apiInfo);
    }
} 