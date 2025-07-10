package controller;

import com.google.gson.Gson;
import dao.WaitlistDAO;
import model.Waitlist;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.stream.Collectors;

@WebServlet(name = "WaitlistReceptionistServlet", urlPatterns = {"/receptionist/waitlist", "/receptionist/waitlist/*"})
public class WaitlistReceptionistServlet extends HttpServlet {
    private final WaitlistDAO waitlistDAO = new WaitlistDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try (PrintWriter out = response.getWriter()) {
            List<Waitlist> waitlist = waitlistDAO.getAllWaitlistForReceptionist();
            if (waitlist != null && !waitlist.isEmpty()) {
                String json = gson.toJson(waitlist);
                out.print(json);
            } else {
                out.print("[]"); 
            }
            out.flush();
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            String error = gson.toJson(new ErrorResponse("Failed to fetch waitlist data: " + e.getMessage()));
            response.getWriter().write(error);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            // Extract waitlistId from URL path
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || !pathInfo.matches("/\\d+/status")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(new ErrorResponse("Invalid request format")));
                return;
            }
            
            int waitlistId = Integer.parseInt(pathInfo.split("/")[1]);
            
            // Read request body
            String body = request.getReader().lines().collect(Collectors.joining());
            StatusUpdateRequest statusUpdate = gson.fromJson(body, StatusUpdateRequest.class);
            
            if (statusUpdate == null || statusUpdate.getStatus() == null || statusUpdate.getStatus().trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(new ErrorResponse("Status cannot be empty")));
                return;
            }
            
            boolean updated = waitlistDAO.updateWaitlistStatusByReceptionist(waitlistId, statusUpdate.getStatus());
            
            if (updated) {
                out.print(gson.toJson(new SuccessResponse("Status updated successfully")));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print(gson.toJson(new ErrorResponse("Waitlist entry not found or status update failed")));
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(new ErrorResponse("Failed to update status: " + e.getMessage())));
        } finally {
            out.flush();
            out.close();
        }
    }

    // Helper classes for JSON serialization/deserialization
    private static class StatusUpdateRequest {
        private String status;
        
        public String getStatus() {
            return status;
        }
    }
    
    private static class ErrorResponse {
        private final String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
    }
    
    private static class SuccessResponse {
        private final String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
    }
} 