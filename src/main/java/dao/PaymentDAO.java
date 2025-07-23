package dao;

import model.Payment;
import java.sql.*;
import java.util.*;

public class PaymentDAO {

    // Lấy tất cả payment records cho Admin Business dashboard
    public List<Payment> getAllPayments() {
        List<Payment> payments = new ArrayList<>();
        String sql = "SELECT * FROM Payment ORDER BY payment_date DESC";
        DBContext db = DBContext.getInstance();

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Payment payment = new Payment(
                        rs.getInt("payment_id"),
                        rs.getDouble("amount"),
                        rs.getString("payment_type"),
                        rs.getInt("invoice_id"),
                        rs.getTimestamp("payment_date").toLocalDateTime(),
                        rs.getString("status")
                );
                payments.add(payment);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return payments;
    }

    // Lấy payment theo ID
    public Payment getPaymentById(int paymentId) {
        String sql = "SELECT * FROM Payment WHERE payment_id = ?";
        DBContext db = DBContext.getInstance();

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, paymentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Payment(
                            rs.getInt("payment_id"),
                            rs.getDouble("amount"),
                            rs.getString("payment_type"),
                            rs.getInt("invoice_id"),
                            rs.getTimestamp("payment_date").toLocalDateTime(),
                            rs.getString("status")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // Cập nhật trạng thái payment
    public boolean updatePaymentStatus(int paymentId, String status) {
        String sql = "UPDATE Payment SET status = ? WHERE payment_id = ?";
        DBContext db = DBContext.getInstance();

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, status);
            ps.setInt(2, paymentId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Thống kê doanh thu theo khoảng thời gian
    public double getTotalRevenueByDateRange(String startDate, String endDate) {
        String sql = "SELECT ISNULL(SUM(amount), 0) as total_revenue FROM Payment " +
                "WHERE payment_date BETWEEN ? AND ? AND status = 'Paid'";
        DBContext db = DBContext.getInstance();

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, startDate);
            ps.setString(2, endDate);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("total_revenue");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0.0;
    }

    // Thống kê doanh thu theo phương thức thanh toán
    public Map<String, Double> getRevenueByPaymentMethod() {
        Map<String, Double> result = new HashMap<>();
        String sql = "SELECT payment_type, ISNULL(SUM(amount), 0) as total " +
                "FROM Payment WHERE status = 'Paid' " +
                "GROUP BY payment_type";
        DBContext db = DBContext.getInstance();

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                result.put(rs.getString("payment_type"), rs.getDouble("total"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    // Lấy payments theo tháng để phân tích xu hướng
    public List<Map<String, Object>> getMonthlyRevenue(int year) {
        List<Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT MONTH(payment_date) as month, " +
                "ISNULL(SUM(amount), 0) as total_amount, " +
                "COUNT(*) as transaction_count " +
                "FROM Payment " +
                "WHERE YEAR(payment_date) = ? AND status = 'Paid' " +
                "GROUP BY MONTH(payment_date) " +
                "ORDER BY month";
        DBContext db = DBContext.getInstance();

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> monthData = new HashMap<>();
                    monthData.put("month", rs.getInt("month"));
                    monthData.put("totalAmount", rs.getDouble("total_amount"));
                    monthData.put("transactionCount", rs.getInt("transaction_count"));
                    result.add(monthData);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    // Lấy top customers theo số tiền thanh toán
    public List<Map<String, Object>> getTopPayingCustomers(int limit) {
        List<Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT TOP (?) p.full_name, ISNULL(SUM(pay.amount), 0) as total_paid, " +
                "COUNT(pay.payment_id) as payment_count " +
                "FROM Payment pay " +
                "JOIN Invoice i ON pay.invoice_id = i.invoice_id " +
                "JOIN Patient p ON i.patient_id = p.patient_id " +
                "WHERE pay.status = 'Paid' " +
                "GROUP BY p.patient_id, p.full_name " +
                "ORDER BY total_paid DESC";
        DBContext db = DBContext.getInstance();

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, limit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> customer = new HashMap<>();
                    customer.put("customerName", rs.getString("full_name"));
                    customer.put("totalPaid", rs.getDouble("total_paid"));
                    customer.put("paymentCount", rs.getInt("payment_count"));
                    result.add(customer);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    // Lấy danh sách payment với thông tin bệnh nhân, chẩn đoán, hóa đơn
    public List<Map<String, Object>> getAllPaymentsWithDiagnosis() {
        List<Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT p.full_name, " +
                "ISNULL(CONVERT(varchar, p.dob, 23), '') as dob, " +
                "ISNULL(p.gender, '') as gender, " +
                "ISNULL(d.disease, '') as disease, " +
                "ISNULL(d.conclusion, '') as conclusion, " +
                "ISNULL(d.treatment_plan, '') as treatment_plan, " +
                "i.invoice_id, " +
                "ISNULL(i.total_amount, 0) as total_amount, " +
                "ISNULL(i.status, '') as status, " +
                "ISNULL(CONVERT(varchar, i.issue_date, 20), '') as payment_date " +
                "FROM Diagnosis d " +
                "JOIN MedicineRecords m ON d.medicineRecord_id = m.medicineRecord_id " +
                "JOIN Patient p ON p.patient_id = m.patient_id " +
                "JOIN Invoice i ON i.medicineRecord_id = m.medicineRecord_id ";
        DBContext db = DBContext.getInstance();
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> payment = new HashMap<>();
                payment.put("full_name", rs.getString("full_name"));
                payment.put("dob", rs.getString("dob"));
                payment.put("gender", rs.getString("gender"));
                payment.put("disease", rs.getString("disease"));
                payment.put("conclusion", rs.getString("conclusion"));
                payment.put("treatment_plan", rs.getString("treatment_plan"));
                payment.put("invoice_id", rs.getInt("invoice_id"));
                payment.put("total_amount", rs.getDouble("total_amount"));
                payment.put("status", rs.getString("status"));
                payment.put("payment_date", rs.getString("payment_date"));
                result.add(payment);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    // Update all fields for a payment
    public boolean updatePayment(int paymentId, double amount, String paymentType, String status, java.sql.Timestamp paymentDate) {
        String sql = "UPDATE Payment SET amount = ?, payment_type = ?, status = ?, payment_date = ? WHERE payment_id = ?";
        DBContext db = DBContext.getInstance();
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, amount);
            ps.setString(2, paymentType);
            ps.setString(3, status);
            ps.setTimestamp(4, paymentDate);
            ps.setInt(5, paymentId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}