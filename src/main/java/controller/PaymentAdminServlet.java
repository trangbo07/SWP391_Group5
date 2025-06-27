package controller;

import dao.PaymentDAO;
import model.Payment;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import com.google.gson.Gson;

@WebServlet({"/payment-admin", "/payment-admin/analytics", "/payment-admin/update-status", "/payment-admin/update"})
public class PaymentAdminServlet extends HttpServlet {
    private PaymentDAO paymentDAO = new PaymentDAO();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();

        switch (path) {
            case "/payment-admin":
                handleGetAllPayments(req, resp);
                break;
            case "/payment-admin/analytics":
                handleGetAnalytics(req, resp);
                break;
            default:
                resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();

        if ("/payment-admin/update-status".equals(path)) {
            handleUpdatePaymentStatus(req, resp);
        } else if ("/payment-admin/update".equals(path)) {
            handleUpdatePayment(req, resp);
        } else {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private void handleGetAllPayments(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        try {
            // Trả về JSON cho AJAX request
            if ("application/json".equals(req.getHeader("Accept"))) {
                List<Map<String, Object>> payments = paymentDAO.getAllPaymentsWithCustomer();
                resp.setContentType("application/json");
                resp.setCharacterEncoding("UTF-8");
                resp.getWriter().write(gson.toJson(payments));
            } else {
                // Forward to HTML page
                req.getRequestDispatcher("/view/payment.html").forward(req, resp);
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Failed to fetch payments\"}");
        }
    }

    private void handleGetAnalytics(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String startDate = req.getParameter("startDate");
            String endDate = req.getParameter("endDate");
            String year = req.getParameter("year");

            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");

            Map<String, Object> analytics = Map.of(
                    "totalRevenue", startDate != null && endDate != null ?
                            paymentDAO.getTotalRevenueByDateRange(startDate, endDate) : 0.0,
                    "revenueByPaymentMethod", paymentDAO.getRevenueByPaymentMethod(),
                    "monthlyRevenue", year != null ?
                            paymentDAO.getMonthlyRevenue(Integer.parseInt(year)) :
                            paymentDAO.getMonthlyRevenue(2024),
                    "topCustomers", paymentDAO.getTopPayingCustomers(10)
            );

            resp.getWriter().write(gson.toJson(analytics));
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Failed to fetch analytics\"}");
        }
    }

    private void handleUpdatePaymentStatus(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String paymentIdParam = req.getParameter("paymentId");
            String status = req.getParameter("status");

            if (paymentIdParam == null || status == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Missing parameters\"}");
                return;
            }

            int paymentId = Integer.parseInt(paymentIdParam);
            boolean updated = paymentDAO.updatePaymentStatus(paymentId, status);

            resp.setContentType("application/json");
            if (updated) {
                resp.getWriter().write("{\"success\": true, \"message\": \"Payment status updated successfully\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write("{\"success\": false, \"message\": \"Failed to update payment status\"}");
            }
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Invalid payment ID\"}");
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Internal server error\"}");
        }
    }

    private void handleUpdatePayment(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String paymentIdParam = req.getParameter("paymentId");
            String amountParam = req.getParameter("amount");
            String paymentType = req.getParameter("paymentType");
            String status = req.getParameter("status");
            String paymentDateParam = req.getParameter("paymentDate");

            if (paymentIdParam == null || amountParam == null || paymentType == null || status == null || paymentDateParam == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Missing parameters\"}");
                return;
            }

            int paymentId = Integer.parseInt(paymentIdParam);
            double amount = Double.parseDouble(amountParam.replace("$", "").replace(",", ""));
            java.sql.Timestamp paymentDate = java.sql.Timestamp.valueOf(paymentDateParam + " 00:00:00");

            boolean updated = paymentDAO.updatePayment(paymentId, amount, paymentType, status, paymentDate);

            resp.setContentType("application/json");
            if (updated) {
                resp.getWriter().write("{\"success\": true, \"message\": \"Payment updated successfully\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write("{\"success\": false, \"message\": \"Failed to update payment\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Internal server error\"}");
        }
    }
} 