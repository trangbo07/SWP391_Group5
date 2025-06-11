package controller;

import dao.AccountPatientDAO;
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

        // Đăng ký tài khoản
        boolean success = AccountPatientDAO.registerPatient(username, email, password, "Enable");

        // Trả về kết quả dạng JSON
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        if (success) {
            out.print("{\"success\": true, \"message\": \"Đăng ký thành công\"}");
        } else {
            out.print("{\"success\": false, \"message\": \"Email đã tồn tại\"}");
        }
    }
}
