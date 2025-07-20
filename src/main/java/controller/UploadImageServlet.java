

package controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import dao.DoctorDAO;
import model.AccountStaff;

@WebServlet(name = "UploadImageServlet", urlPatterns = {"/api/upload-image"})
public class UploadImageServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String imageUrl = request.getParameter("imageUrl");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        HttpSession session = request.getSession(false);
        if (imageUrl == null || imageUrl.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\":false,\"message\":\"Missing imageUrl\"}");
            return;
        }
        if (session == null || session.getAttribute("user") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"success\":false,\"message\":\"Not logged in\"}");
            return;
        }
        AccountStaff user = (AccountStaff) session.getAttribute("user");
        int accountStaffId = user.getAccount_staff_id(); // hoặc user.getAccountStaffId();
        DoctorDAO dao = new DoctorDAO();
        boolean updated = dao.updateDoctorImage(accountStaffId, imageUrl);
        if (updated) {
            out.print("{\"success\":true,\"imageUrl\":\"" + imageUrl + "\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\":false,\"message\":\"Failed to update image in database\"}");
        }
    }
} 