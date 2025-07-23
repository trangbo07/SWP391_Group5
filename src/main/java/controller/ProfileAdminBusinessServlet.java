package controller;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import com.google.gson.Gson;
import dao.AdminbusinessDAO;
import dto.AdminBusinessDTO;

@WebServlet("/api/admin-business/profile")
public class ProfileAdminBusinessServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private AdminbusinessDAO adminDAO = new AdminbusinessDAO();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        Integer accountStaffId = (Integer) session.getAttribute("account_staff_id");
        
        if (accountStaffId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Not authenticated\"}");
            return;
        }
        
        AdminBusinessDTO profile = adminDAO.getAdminBusinessProfile(accountStaffId);
        
        if (profile != null) {
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(gson.toJson(profile));
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().write("{\"error\": \"Profile not found\"}");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        Integer accountStaffId = (Integer) session.getAttribute("account_staff_id");
        
        if (accountStaffId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Not authenticated\"}");
            return;
        }
        
        String action = request.getParameter("action");
        
        if ("changePassword".equals(action)) {
            String newPassword = request.getParameter("newPassword");
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Password cannot be empty\"}");
                return;
            }
            
            boolean success = adminDAO.updatePassword(accountStaffId, newPassword);
            
            response.setContentType("application/json");
            if (success) {
                response.getWriter().write("{\"success\": true, \"message\": \"Password updated successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\": false, \"message\": \"Failed to update password\"}");
            }
        }
    }
} 