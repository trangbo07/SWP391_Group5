package controller;

import com.google.gson.Gson;
import dao.AdminbusinessDAO;
import dto.AdminBusinessDTO;
import model.AccountStaff;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/adminbusiness/profile")
public class AdminBusinessProfileApiServlet extends HttpServlet {
    private AdminbusinessDAO dao = new AdminbusinessDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();
        AccountStaff acc = (AccountStaff) session.getAttribute("user");
        if (acc != null && "AdminBusiness".equals(acc.getRole())) {
            try {
                AdminBusinessDTO profile = dao.getAdminBusinessProfile(acc.getAccountStaffId());
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(new Gson().toJson(profile));
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\":\"Lỗi server\"}");
            }
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Chưa đăng nhập hoặc không có quyền\"}");
        }
    }
} 