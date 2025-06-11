package controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountPatient;
import model.AccountPharmacist;
import model.AccountStaff;

import java.io.IOException;

@WebFilter("/*")
public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        HttpSession session = request.getSession(false);

        if (uri.equals(contextPath + "/")) {
            response.sendRedirect(contextPath + "/home");
            return;
        }

        if (
                uri.endsWith("/reset") || uri.endsWith("/login") || uri.endsWith("/logout") ||
                        uri.endsWith(".html") || uri.endsWith(".css") || uri.endsWith(".js") || uri.endsWith("/register") ||
                        uri.contains("/../assets/")|| uri.contains(".png") || uri.contains(".jpg") || uri.contains(".webp") ||
                        uri.startsWith(contextPath + "/home") ||uri.contains(".svg")) {
            chain.doFilter(request, response);
            return;
        }


        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect(contextPath + "/home");
            return;
        }

        Object user = session.getAttribute("user");

        if (user instanceof AccountStaff && uri.startsWith(request.getContextPath() + "/staff")) {
            chain.doFilter(request, response);
        } else if (user instanceof AccountPharmacist && uri.startsWith(request.getContextPath() + "/pharmacist")) {
            chain.doFilter(request, response);
        } else if (user instanceof AccountPatient && uri.startsWith(request.getContextPath() + "/patient")) {
            chain.doFilter(request, response);
        } else {
            response.sendRedirect(request.getContextPath() + "/login?error=unauthorized");
        }
    }
}