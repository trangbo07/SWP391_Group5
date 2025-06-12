package controller.pharmacist;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet("/pharmacist/*")
public class PharmacistServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        forwardRequest(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        forwardRequest(req, resp);
    }

    private void forwardRequest(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            resp.sendRedirect(req.getContextPath() + "/home");
            return;
        }

        String path = req.getPathInfo(); // /home, /profile, ...

        if (path == null || path.equals("/")) {
            resp.sendRedirect(req.getContextPath() + "/pharmacist/home");
            return;
        }

        switch (path) {
            case "/logout":
                session.invalidate();
                resp.sendRedirect(req.getContextPath() + "/home");
                return;
            case "/home":
                resp.sendRedirect(req.getContextPath() + req.getServletPath() + "/home");
                return;
            case "/profile":
                resp.sendRedirect(req.getContextPath() + req.getServletPath() + "/profile");
                return;
            default:
                resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Không tìm thấy: " + path);
        }
    }
}
