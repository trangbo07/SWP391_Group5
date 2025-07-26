package controller;

import com.google.gson.Gson;
import dao.DoctorDAO;
import dao.AccountStaffDAO;
import dto.DoctorDetailsDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountStaff;
import org.json.JSONObject;
import util.PasswordHasherSHA256Util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/api/doctor/profile")
public class DoctorProfileServlet extends HttpServlet {

    private final Gson gson = new Gson();
    private final DoctorDAO doctorDAO = new DoctorDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Check session
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect(request.getContextPath() + "/view/home.html");
            return;
        }

        // Get user
        AccountStaff user = (AccountStaff) session.getAttribute("user");
        int accountStaffId = user.getAccount_staff_id();

        // Get doctor details
        DoctorDetailsDTO doctorDetails = doctorDAO.getDoctorDetailsByAccountStaffId(accountStaffId);
        if (doctorDetails == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            PrintWriter out = response.getWriter();
            out.write("{\"error\":\"Doctor not found\"}");
            out.flush();
            return;
        }

        // Return JSON
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(doctorDetails));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        HttpSession session = request.getSession();
        AccountStaff doctor = (AccountStaff) session.getAttribute("user");
        
        if (doctor == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"success\": false, \"message\": \"Chưa đăng nhập\"}");
            return;
        }
        
        String action = request.getParameter("action");
        
        if ("changePassword".equals(action)) {
            handleChangePassword(request, response, doctor);
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\": false, \"message\": \"Hành động không hợp lệ\"}");
        }
    }
    
    private void handleChangePassword(HttpServletRequest request, HttpServletResponse response, AccountStaff doctor) 
            throws IOException {
        
        PrintWriter out = response.getWriter();
        
        try {
            // Đọc JSON từ request body
            BufferedReader reader = request.getReader();
            StringBuilder jsonBuffer = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuffer.append(line);
            }
            
            JSONObject json = new JSONObject(jsonBuffer.toString());
            String oldPassword = json.getString("oldPassword");
            String newPassword = json.getString("newPassword");
            
            // Validate input
            if (oldPassword == null || oldPassword.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Vui lòng nhập mật khẩu cũ\"}");
                return;
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Vui lòng nhập mật khẩu mới\"}");
                return;
            }
            
            // Validate password strength
            if (newPassword.length() < 8) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Mật khẩu mới phải có ít nhất 8 ký tự\"}");
                return;
            }
            
            if (newPassword.length() > 30) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Mật khẩu mới không được quá 30 ký tự\"}");
                return;
            }
            
            // Check if password starts with uppercase letter
            if (!Character.isUpperCase(newPassword.charAt(0))) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Mật khẩu mới phải bắt đầu bằng chữ hoa\"}");
                return;
            }
            
            // Check if password contains at least one digit
            if (!newPassword.matches(".*\\d.*")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Mật khẩu mới phải có ít nhất 1 số\"}");
                return;
            }
            
            // Check if password contains at least one special character
            if (!newPassword.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt\"}");
                return;
            }
            
            // Hash passwords
            String hashedOldPassword = PasswordHasherSHA256Util.hashPassword(oldPassword);
            String hashedNewPassword = PasswordHasherSHA256Util.hashPassword(newPassword);
            
            // Verify old password and update
            AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
            boolean success = accountStaffDAO.updatePasswordIfMatch(doctor.getAccount_staff_id(), hashedOldPassword, hashedNewPassword);
            
            if (success) {
                out.print("{\"success\": true, \"message\": \"Đổi mật khẩu thành công!\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Mật khẩu cũ không đúng\"}");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\": false, \"message\": \"Lỗi máy chủ: " + e.getMessage() + "\"}");
        }
    }
}