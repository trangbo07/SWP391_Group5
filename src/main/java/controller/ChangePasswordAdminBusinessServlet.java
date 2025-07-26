package controller;

import com.google.gson.Gson;
import dao.AdminbusinessDAO;
import model.AccountStaff;
import util.NormalizeUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/adminbusiness/change-password")
public class ChangePasswordAdminBusinessServlet extends HttpServlet {
    private AdminbusinessDAO dao = new AdminbusinessDAO();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        HttpSession session = request.getSession();
        AccountStaff acc = (AccountStaff) session.getAttribute("user");
        
        if (acc == null || !"AdminBusiness".equals(acc.getRole())) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"success\": false, \"message\": \"Chưa đăng nhập hoặc không có quyền\"}");
            return;
        }

        try {
            // Đọc dữ liệu từ request body
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            Map<String, String> requestData = gson.fromJson(sb.toString(), Map.class);
            
            String currentPassword = requestData.get("currentPassword");
            String newPassword = requestData.get("newPassword");
            String confirmPassword = requestData.get("confirmPassword");
            
            // Validation
            Map<String, String> errors = validatePasswordChange(currentPassword, newPassword, confirmPassword);
            
            if (!errors.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write(gson.toJson(Map.of(
                    "success", false,
                    "message", "Dữ liệu không hợp lệ",
                    "errors", errors
                )));
                return;
            }
            
            // Kiểm tra mật khẩu hiện tại
            System.out.println("Verifying password for account ID: " + acc.getAccountStaffId());
            if (!dao.verifyCurrentPassword(acc.getAccountStaffId(), currentPassword)) {
                System.out.println("Password verification failed");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write(gson.toJson(Map.of(
                    "success", false,
                    "message", "Mật khẩu hiện tại không đúng"
                )));
                return;
            }
            System.out.println("Password verification successful");
            
            // Đổi mật khẩu
            System.out.println("Changing password for account ID: " + acc.getAccountStaffId());
            boolean success = dao.changePassword(acc.getAccountStaffId(), newPassword);
            
            if (success) {
                System.out.println("Password change successful");
                response.getWriter().write(gson.toJson(Map.of(
                    "success", true,
                    "message", "Đổi mật khẩu thành công"
                )));
            } else {
                System.out.println("Password change failed");
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write(gson.toJson(Map.of(
                    "success", false,
                    "message", "Có lỗi xảy ra khi đổi mật khẩu"
                )));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(Map.of(
                "success", false,
                "message", "Lỗi server"
            )));
        }
    }
    
    private Map<String, String> validatePasswordChange(String currentPassword, String newPassword, String confirmPassword) {
        Map<String, String> errors = new HashMap<>();
        
        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            errors.put("currentPassword", "Vui lòng nhập mật khẩu hiện tại");
        }
        
        if (newPassword == null || newPassword.trim().isEmpty()) {
            errors.put("newPassword", "Vui lòng nhập mật khẩu mới");
        } else if (newPassword.length() < 6) {
            errors.put("newPassword", "Mật khẩu mới phải có ít nhất 6 ký tự");
        } else if (newPassword.equals(currentPassword)) {
            errors.put("newPassword", "Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }
        
        if (confirmPassword == null || confirmPassword.trim().isEmpty()) {
            errors.put("confirmPassword", "Vui lòng xác nhận mật khẩu mới");
        } else if (!newPassword.equals(confirmPassword)) {
            errors.put("confirmPassword", "Mật khẩu xác nhận không khớp");
        }
        
        return errors;
    }
} 