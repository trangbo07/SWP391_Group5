package dao;

import dto.PaymentAdminDTO;
import java.sql.*;
import java.util.*;

public class PaymentAdminDAO {
    public List<PaymentAdminDTO> getAllPaymentAdminInfo() {
        List<PaymentAdminDTO> list = new ArrayList<>();
        String sql = """
            SELECT p.full_name, p.dob, p.gender, d.disease, d.conclusion, d.treatment_plan, i.status,
                ISNULL(service_total, 0) AS serviceAmount,
                ISNULL(medicine_total, 0) AS medicineAmount,
                ISNULL(service_total, 0) + ISNULL(medicine_total, 0) AS totalAmount
            FROM Diagnosis d
            JOIN MedicineRecords m ON d.medicineRecord_id = m.medicineRecord_id
            JOIN Patient p ON p.patient_id = m.patient_id
            JOIN Invoice i ON i.medicineRecord_id = m.medicineRecord_id
            LEFT JOIN (
                SELECT invoice_id, SUM(total_price) AS service_total
                FROM ServiceInvoice
                GROUP BY invoice_id
            ) si ON i.invoice_id = si.invoice_id
            LEFT JOIN (
                SELECT pi.invoice_id, SUM(mds.quantity * med.price) AS medicine_total
                FROM PrescriptionInvoice pi
                JOIN Medicines mds ON pi.prescription_invoice_id = mds.prescription_invoice_id
                JOIN Medicine med ON mds.medicine_id = med.medicine_id
                GROUP BY pi.invoice_id
            ) mi ON i.invoice_id = mi.invoice_id
        """;
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                PaymentAdminDTO dto = new PaymentAdminDTO(
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("disease"),
                        rs.getString("conclusion"),
                        rs.getString("treatment_plan"),
                        rs.getDouble("serviceAmount"),
                        rs.getDouble("medicineAmount"),
                        rs.getDouble("totalAmount"),
                        rs.getString("status")
                );
                list.add(dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    

    // Cập nhật payment (chỉ cập nhật Invoice, có thể mở rộng cập nhật Diagnosis/Patient nếu cần)
    public boolean updatePayment(int invoiceId, PaymentAdminDTO dto) {
        String sql = "UPDATE Invoice SET total_amount = ?, status = ? WHERE invoice_id = ?";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, dto.getTotalAmount());
            ps.setString(2, dto.getStatus());
            ps.setInt(3, invoiceId);
            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
} 