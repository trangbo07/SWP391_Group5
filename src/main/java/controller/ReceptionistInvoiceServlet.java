package controller;

import com.google.gson.Gson;
import dao.InvoiceDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountStaff;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet("/api/receptionist/invoices/*")
public class ReceptionistInvoiceServlet extends HttpServlet {
    private final InvoiceDAO invoiceDAO = new InvoiceDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            HttpSession session = req.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                resp.setStatus(401);
                out.write("{\"error\":\"Not logged in\"}");
                return;
            }

            // Check if user is receptionist
            AccountStaff user = (AccountStaff) session.getAttribute("user");
            if (!"Receptionist".equals(user.getRole())) {
                resp.setStatus(403);
                out.write("{\"error\":\"Access denied\"}");
                return;
            }

            String pathInfo = req.getPathInfo();
            
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all invoices
                List<Map<String, Object>> invoices = invoiceDAO.getAllInvoicesWithDetails();
                out.write(gson.toJson(invoices));
            } else if (pathInfo.matches("/\\d+")) {
                // Get specific invoice by ID
                int invoiceId = Integer.parseInt(pathInfo.substring(1));
                Map<String, Object> invoice = invoiceDAO.getInvoiceDetailsWithItems(invoiceId);
                
                if (invoice != null) {
                    out.write(gson.toJson(invoice));
                } else {
                    resp.setStatus(404);
                    out.write("{\"error\":\"Invoice not found\"}");
                }
            } else if (pathInfo.matches("/\\d+/print")) {
                // Print invoice (redirect to print page)
                int invoiceId = Integer.parseInt(pathInfo.split("/")[1]);
                resp.sendRedirect("/receptionist/invoice-print.jsp?id=" + invoiceId);
            } else {
                resp.setStatus(400);
                out.write("{\"error\":\"Invalid request\"}");
            }

        } catch (Exception e) {
            resp.setStatus(500);
            out.write("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            HttpSession session = req.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                resp.setStatus(401);
                out.write("{\"error\":\"Not logged in\"}");
                return;
            }

            // Check if user is receptionist
            AccountStaff user = (AccountStaff) session.getAttribute("user");
            if (!"Receptionist".equals(user.getRole())) {
                resp.setStatus(403);
                out.write("{\"error\":\"Access denied\"}");
                return;
            }

            String pathInfo = req.getPathInfo();
            
            if (pathInfo != null && pathInfo.matches("/\\d+/status")) {
                // Update invoice status
                int invoiceId = Integer.parseInt(pathInfo.split("/")[1]);
                
                // Read request body
                String body = req.getReader().lines().collect(Collectors.joining());
                StatusUpdateRequest statusRequest = gson.fromJson(body, StatusUpdateRequest.class);
                
                if (statusRequest.status == null) {
                    resp.setStatus(400);
                    out.write("{\"error\":\"Status is required\"}");
                    return;
                }

                boolean success = invoiceDAO.updateInvoiceStatus(invoiceId, statusRequest.status);
                
                if (success) {
                    out.write("{\"success\":true,\"message\":\"Invoice status updated successfully\"}");
                } else {
                    resp.setStatus(500);
                    out.write("{\"error\":\"Failed to update invoice status\"}");
                }
            } else {
                resp.setStatus(400);
                out.write("{\"error\":\"Invalid request\"}");
            }

        } catch (Exception e) {
            resp.setStatus(500);
            out.write("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }

    private static class StatusUpdateRequest {
        String status;
    }
} 