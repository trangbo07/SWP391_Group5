package controller;

import dao.AccountPatientDAO;
import dao.AccountStaffDAO;
import dao.AccountPharmacistDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet(name = "RegisterServlet", urlPatterns = {"/register"})
@MultipartConfig
public class RegisterServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("view/registration.html").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Debug: In ra tất cả các parameters
        System.out.println("Content Type: " + request.getContentType());
        
        // Lấy dữ liệu từ form multipart
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String username = request.getParameter("username");

        // Kiểm tra dữ liệu đầu vào
        if (email == null || password == null || username == null || 
            email.trim().isEmpty() || password.trim().isEmpty() || username.trim().isEmpty()) {
            response.setContentType("application/json");
            PrintWriter out = response.getWriter();
            out.print("{\"success\": false, \"message\": \"Vui lòng điền đầy đủ thông tin\"}");
            return;
        }
        boolean userNameEmailExists = AccountStaffDAO.checkAccountStaff(username, email)
                || AccountPharmacistDAO.checkAccountPharmacist(username,email);


        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if (userNameEmailExists) {
            out.print("{\"success\": false, \"message\": \"Email hoặc Username đã tồn tại\"}");
            return;
        }

        // Đăng ký tài khoản mới
        boolean success = AccountPatientDAO.registerPatient(username, email, password, "Enable");

        if (success) {
            out.print("{\"success\": true, \"message\": \"Đăng ký thành công\"}");
        } else {
            out.print("{\"success\": false, \"message\": \"Đăng ký thất bại. Vui lòng thử lại sau.\"}");
        }

    }
}
