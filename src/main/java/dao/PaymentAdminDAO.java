package dao;

import dto.PaymentAdminDTO;
import java.sql.*;
import java.util.*;

public class PaymentAdminDAO {
    public List<PaymentAdminDTO> getAllPaymentAdminInfo() {
        List<PaymentAdminDTO> list = new ArrayList<>();
        String sql = "SELECT p.full_name, p.dob, p.gender, d.disease, d.conclusion, d.treatment_plan, i.total_amount, i.status  " +
                "FROM Diagnosis d  " +
                "JOIN MedicineRecords m ON d.medicineRecord_id = m.medicineRecord_id  " +
                "JOIN Patient p ON p.patient_id = m.patient_id  " +
                "JOIN Invoice i ON i.medicineRecord_id = m.medicineRecord_id ";
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
                        rs.getDouble("total_amount"),
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
            ps.setDouble(1, dto.getTotal_amount());
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