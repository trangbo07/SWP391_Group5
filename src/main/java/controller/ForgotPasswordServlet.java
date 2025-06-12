package controller;

import dao.AccountDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.*;
import util.EmailService;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Random;

@WebServlet(name = "ForgotPasswordServlet", urlPatterns = {"/reset"})
@MultipartConfig
public class ForgotPasswordServlet extends HttpServlet {
    private AccountDAO accountDAO = new AccountDAO();
    private static final long OTP_VALID_DURATION = 10 * 60 * 1000; // 10 minutes

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("view/reset-password.html").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if ("sendOTP".equals(action)) {
            handleSendOTP(request, response, out);
        } else if ("resetPassword".equals(action)) {
            handleResetPassword(request, response, out);
        } else {
            out.print("{\"success\": false, \"message\": \"Invalid action\"}");
        }
    }

    private void handleSendOTP(HttpServletRequest request, HttpServletResponse response, PrintWriter out)
            throws ServletException, IOException {
        String email = request.getParameter("email");

        // Check if email exists
        Object account = accountDAO.checkAccount1("", email);
        if (account == null) {
            out.print("{\"success\": false, \"message\": \"Email does not exist in the system\"}");
            return;
        }

        // Generate 6-digit OTP
        String otp = generateOTP();

        // Store OTP and timestamp in session
        HttpSession session = request.getSession();
        session.setAttribute("otp", otp);
        session.setAttribute("otpTimestamp", System.currentTimeMillis());
        session.setAttribute("resetEmail", email);

        // Send OTP email
        String subject = "OTP code to reset your password";
        String content = EmailService.generateOtpEmailContent(otp);
        boolean emailSent = EmailService.sendEmail(email, subject, content);

        if (emailSent) {
            out.print("{\"success\": true, \"message\": \"OTP code has been sent to your email\"}");
        } else {
            out.print("{\"success\": false, \"message\": \"Error sending OTP email. Please try again.\"}");
        }
    }

    private void handleResetPassword(HttpServletRequest request, HttpServletResponse response, PrintWriter out)
            throws ServletException, IOException {
        HttpSession session = request.getSession();
        String storedOTP = (String) session.getAttribute("otp");
        Long otpTimestamp = (Long) session.getAttribute("otpTimestamp");
        String resetEmail = (String) session.getAttribute("resetEmail");
        String otp = request.getParameter("otp");
        String newPassword = request.getParameter("newPassword");

        // Validate OTP and session
        if (storedOTP == null || otpTimestamp == null || resetEmail == null) {
            out.print("{\"success\": false, \"message\": \"Invalid or expired OTP session\"}");
            return;
        }

        // Check OTP expiration
        if (System.currentTimeMillis() - otpTimestamp > OTP_VALID_DURATION) {
            session.removeAttribute("otp");
            session.removeAttribute("otpTimestamp");
            session.removeAttribute("resetEmail");
            out.print("{\"success\": false, \"message\": \"OTP code has expired\"}");
            return;
        }

        // Verify OTP
        if (!storedOTP.equals(otp)) {
            out.print("{\"success\": false, \"message\": \"Incorrect OTP code\"}");
            return;
        }

        // Update password using AccountDAO
        boolean passwordUpdated = accountDAO.updatePassword(resetEmail, newPassword);
        if (passwordUpdated) {
            session.removeAttribute("otp");
            session.removeAttribute("otpTimestamp");
            session.removeAttribute("resetEmail");
            out.print("{\"success\": true, \"message\": \"Password reset successful\"}");
        } else {
            out.print("{\"success\": false, \"message\": \"Error resetting password. Please try again.\"}");
        }
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}