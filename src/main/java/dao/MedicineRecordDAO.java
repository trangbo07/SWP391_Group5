package dao;

import dto.PatientDTO;
import dto.RecordSummaryDTO;
import model.MedicineRecords;
import java.sql.*;
import java.util.*;

public class MedicineRecordDAO {
    public List<PatientDTO> getSummaryByPatientId(int acc_patientId) {
        List<PatientDTO> list = new ArrayList<>();

        String sql = """
        SELECT p.patient_id, p.full_name, p.dob, p.gender, p.phone, p.address
        FROM Patient p
        JOIN Patient_AccountPatient pap ON p.patient_id = pap.patient_id
        WHERE pap.account_patient_id = ?
    """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, acc_patientId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(new PatientDTO(
                        rs.getInt("patient_id"),  // Sửa từ "id" thành "patient_id"
                        rs.getString("full_name"),  // Sửa từ "fullName" thành "full_name"
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

    public int createMedicineRecord(int patientId) {
        String sql = "INSERT INTO MedicineRecords (patient_id) VALUES (?)";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, patientId);
            int rowsAffected = ps.executeUpdate();

            if (rowsAffected > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return -1;
    }

    public MedicineRecords getMedicineRecordById(int medicineRecordId) {
        String sql = "SELECT * FROM MedicineRecords WHERE medicineRecord_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, medicineRecordId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new MedicineRecords(
                        rs.getInt("medicineRecord_id"),
                        rs.getInt("patient_id")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public MedicineRecords getLatestMedicineRecordByPatientId(int patientId) {
        String sql = """
            SELECT TOP 1 * FROM MedicineRecords 
            WHERE patient_id = ? 
            ORDER BY medicineRecord_id DESC
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new MedicineRecords(
                        rs.getInt("medicineRecord_id"),
                        rs.getInt("patient_id")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public MedicineRecords getMedicineRecordByAppointmentId(int appointmentId) {
        String sql = "SELECT * FROM MedicineRecords WHERE appointment_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, appointmentId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new MedicineRecords(
                        rs.getInt("medicineRecord_id"),
                        rs.getInt("patient_id")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}
