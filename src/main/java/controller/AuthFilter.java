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

        // Get the context path and servlet path for more accurate matching
        String contextPath = req.getContextPath();
        String servletPath = req.getServletPath();
        
        // List of paths that can be accessed without login
        if (requestURI.endsWith("/api/login") ||
                requestURI.endsWith("/api/register") ||
                requestURI.endsWith("/api/logout") ||
                requestURI.endsWith("/api/reset") ||
                requestURI.endsWith("/view/home.html") ||
                requestURI.endsWith("/view/login.html") ||
                requestURI.endsWith("/view/registration.html") ||
                requestURI.endsWith("/view/reset-password.html") ||
                requestURI.equals("/") ||
                requestURI.equals(contextPath + "/") ||
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
            chain.doFilter(request, response); // Allow to proceed
        } else {
            // If it's an API request, return JSON response
            if (requestURI.startsWith("/api/")) {
                res.setContentType("application/json");
                res.setCharacterEncoding("UTF-8");
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401

                PrintWriter out = res.getWriter();
                out.write("{\"error\":\"unauthorized\", \"message\": \"You are not logged in.\"}");
            } else {
                // If it's a regular request, redirect to home.html
                res.sendRedirect(req.getContextPath() + "/view/home.html");
            }
        }
    }
}