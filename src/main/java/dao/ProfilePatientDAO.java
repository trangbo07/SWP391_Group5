package dao;

import dto.PatientDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class ProfilePatientDAO {
    public PatientDTO getPatientDetailByAccountId(int accountPatientId) {
        PatientDTO dto = null;

        String sql = """
            SELECT ap.email, ap.username, ap.img, p.phone, p.full_name
            FROM Patient p
            JOIN Patient_AccountPatient pap ON p.patient_id = pap.patient_id
            JOIN AccountPatient ap ON pap.account_patient_id = ap.account_patient_id
            WHERE ap.account_patient_id = ?
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, accountPatientId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    dto = new PatientDTO(
                            rs.getString("full_name"),
                            rs.getString("phone"),
                            rs.getString("username"),
                            rs.getString("email"),
                            rs.getString("img")
                    );
                }
            }

        } catch (Exception e) {
            System.err.println("Error in getPatientDetailByAccountId: " + e.getMessage());
            e.printStackTrace();
        }

        return dto;
    }
}