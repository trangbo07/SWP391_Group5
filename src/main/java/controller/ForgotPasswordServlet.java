package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.AccountDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.*;
import util.EmailService;
import util.PasswordHasherSHA256Util;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@WebServlet("/api/reset")
public class ForgotPasswordServlet extends HttpServlet {
    private final AccountDAO accountDAO = new AccountDAO();
    private final ObjectMapper mapper = new ObjectMapper(); // Jackson JSON mapper
    private static final long OTP_VALID_DURATION = 10 * 60 * 1000; // 10 phút

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> requestData = mapper.readValue(request.getReader(), Map.class);
        String action = (String) requestData.get("action");

        Map<String, Object> jsonResponse = new HashMap<>();

        if ("sendOTP".equals(action)) {
            handleSendOTP(request, requestData, jsonResponse);
        } else if ("resetPassword".equals(action)) {
            handleResetPassword(request, requestData, jsonResponse);
        } else {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Invalid action");
        }

        mapper.writeValue(response.getWriter(), jsonResponse);
    }

    private void handleSendOTP(HttpServletRequest request, Map<String, Object> requestData, Map<String, Object> jsonResponse) {
        String email = (String) requestData.get("email");

        Object account = accountDAO.checkAccount1(email);
        if (account == null) {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Email does not exist in the system");
            return;
        }

        String otp = generateOTP();

        HttpSession session = request.getSession();
        session.setAttribute("otp", otp);
        session.setAttribute("otpTimestamp", System.currentTimeMillis());
        session.setAttribute("resetEmail", email);

        String subject = "OTP code to reset your password";
        String content = EmailService.generateOtpEmailContent(otp);
        boolean emailSent = EmailService.sendEmail(email, subject, content);

        if (emailSent) {
            jsonResponse.put("success", true);
            jsonResponse.put("message", "OTP code has been sent to your email");
        } else {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Error sending OTP email. Please try again.");
        }
    }

    private void handleResetPassword(HttpServletRequest request, Map<String, Object> requestData, Map<String, Object> jsonResponse) {
        HttpSession session = request.getSession();
        String storedOTP = (String) session.getAttribute("otp");
        Long otpTimestamp = (Long) session.getAttribute("otpTimestamp");
        String resetEmail = (String) session.getAttribute("resetEmail");

        String otp = (String) requestData.get("otp");
        String newPassword = (String) requestData.get("newPassword");

        if (storedOTP == null || otpTimestamp == null || resetEmail == null) {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Invalid or expired OTP session");
            return;
        }

        if (System.currentTimeMillis() - otpTimestamp > OTP_VALID_DURATION) {
            session.invalidate();
            jsonResponse.put("success", false);
            jsonResponse.put("message", "OTP code has expired");
            return;
        }

        if (!storedOTP.equals(otp)) {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Incorrect OTP code");
            return;
        }

        String hashedPassword = PasswordHasherSHA256Util.hashPassword(newPassword);
        boolean updated = accountDAO.updatePassword(resetEmail, hashedPassword);
        if (updated) {
            session.invalidate();
            jsonResponse.put("success", true);
            jsonResponse.put("message", "Password reset successful");
        } else {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Error resetting password. Please try again.");
        }
    }

    private String generateOTP() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }
}
