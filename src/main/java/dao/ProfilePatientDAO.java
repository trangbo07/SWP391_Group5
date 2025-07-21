package dao;

import dto.PatientDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ProfilePatientDAO {
    public List<PatientDTO> getPatientByAccountPatientId(int acc_patientId) {
        List<PatientDTO> list = new ArrayList<>();

        String sql = """
        SELECT *
        FROM Patient p
        JOIN Patient_AccountPatient pap ON p.patient_id = pap.patient_id
        Where pap.account_patient_id = ?
    """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, acc_patientId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(new PatientDTO(
                        rs.getInt("id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone"),
                        rs.getString("address")
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public PatientDTO getPatientById(int patientId) {
        String sql = "SELECT * FROM Patient WHERE patient_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new PatientDTO(
                        rs.getInt("patient_id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone"),
                        rs.getString("address")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}
