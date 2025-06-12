package controller.pharmacist;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet("/pharmacist/profile")
public class PharmacistProfileServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            resp.sendRedirect(req.getContextPath() + "/home");
            return;
        }
        
        resp.sendRedirect(req.getContextPath() + "/view/pharmacist/my-account.html");
//        req.getRequestDispatcher("/view/pharmacist/my-account.html").forward(req, resp);
    }
}

