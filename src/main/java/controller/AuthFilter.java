package controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;

@WebFilter("/*")
public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String requestURI = req.getRequestURI();

        if (requestURI.equals("/api/login") ||
                requestURI.equals("/api/register") ||
                requestURI.equals("/api/logout") ||
                requestURI.equals("/api/reset") ||
                requestURI.equals("/view/home.html") ||
                requestURI.equals("/view/login.html") ||
                requestURI.equals("/view/registration.html") ||
                requestURI.equals("/view/reset-password.html") ||
                requestURI.equals("/") ||
                requestURI.endsWith(".css") ||
                requestURI.endsWith(".js") ||
                requestURI.endsWith(".png") ||
                requestURI.endsWith(".jpg") ||
                requestURI.endsWith(".jpeg") ||
                requestURI.endsWith(".gif") ||
                requestURI.endsWith(".ico")) {
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = req.getSession(false);
        boolean isLoggedIn = (session != null && session.getAttribute("user") != null);

        if (isLoggedIn) {
            chain.doFilter(request, response);
        } else {
            if (requestURI.startsWith("/api/")) {
                res.setContentType("application/json");
                res.setCharacterEncoding("UTF-8");
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401

                PrintWriter out = res.getWriter();
                out.write("{\"error\":\"unauthorized\", \"message\": \"You are not logged in.\"}");
            } else {
                res.sendRedirect(req.getContextPath() + "/view/home.html");
            }
        }
    }
}