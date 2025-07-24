package controller;

import dao.InvoiceDAO;
import model.Invoice;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import com.google.gson.Gson;

import java.util.List;
import dto.PatientDiagnosisInvoiceDTO;
import dao.PaymentDAO;

@WebServlet({"/invoice", "/invoice/update-status"})
public class InvoiceServlet extends HttpServlet {
    private InvoiceDAO invoiceDAO = new InvoiceDAO();
    private PaymentDAO paymentDAO = new PaymentDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String patientIdParam = req.getParameter("patient_id");
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        if (patientIdParam != null) {
            int patientId = Integer.parseInt(patientIdParam);
            List<PatientDiagnosisInvoiceDTO> list = invoiceDAO.getDiagnosisInvoicesByPatientId(patientId);
            String json = new Gson().toJson(list);
            out.print(json);
        } else {
            out.print("{\"error\":\"Thiếu patient_id\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();
        if ("/invoice/update-status".equals(path)) {
            String invoiceIdParam = req.getParameter("invoiceId");
            String status = req.getParameter("status");
            System.out.println("POST /invoice/update-status: invoiceId=" + invoiceIdParam + ", status=" + status);
            resp.setContentType("application/json;charset=UTF-8");
            if (invoiceIdParam != null && status != null) {
                int invoiceId = Integer.parseInt(invoiceIdParam);
                boolean updated = invoiceDAO.updateInvoiceStatus(invoiceId, status);
                // Nếu cập nhật hóa đơn thành công và status là Paid, cập nhật luôn các payment liên quan
                if (updated && "Paid".equalsIgnoreCase(status)) {
                    try {
                        // Cập nhật tất cả payment liên quan sang Paid
                        String sql = "SELECT payment_id FROM Payment WHERE invoice_id = ?";
                        java.sql.Connection conn = dao.DBContext.getInstance().getConnection();
                        java.sql.PreparedStatement ps = conn.prepareStatement(sql);
                        ps.setInt(1, invoiceId);
                        java.sql.ResultSet rs = ps.executeQuery();
                        while (rs.next()) {
                            int paymentId = rs.getInt("payment_id");
                            paymentDAO.updatePaymentStatus(paymentId, "Paid");
                        }
                        rs.close();
                        ps.close();
                        conn.close();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("Update result: " + updated);
                resp.getWriter().print("{\"success\":" + updated + "}");
            } else {
                resp.setStatus(400);
                resp.getWriter().print("{\"error\":\"Thiếu tham số\"}");
            }
        }
    }
} 