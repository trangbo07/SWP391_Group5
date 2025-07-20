package dao;

import model.Patient;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class PatientAccountDAO {

    public List<Patient> getPatientsByAccountId(int accountPatientId) {
        List<Patient> patients = new ArrayList<>();

        String sql = """
            SELECT p.patient_id, p.full_name, p.dob, p.gender, p.phone, p.address
            FROM Patient_AccountPatient pap
            JOIN Patient p ON pap.patient_id = p.patient_id
            WHERE pap.account_patient_id = ?
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, accountPatientId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Patient p = new Patient(
                        rs.getInt("patient_id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone"),
                        rs.getString("address")
                );
                patients.add(p);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return patients;
    }
}