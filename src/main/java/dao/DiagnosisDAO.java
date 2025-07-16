package dao;

import model.DiagnosisDetails;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.sql.*;

public class DiagnosisDAO {
    public List<DiagnosisDetails> getDiagnosisDetailsByDoctorID(int doctor_id) {
        DBContext db = DBContext.getInstance();
        List<DiagnosisDetails> list = new ArrayList<>();

        try {
            String sql = """
                SELECT p.full_name, p.dob, p.gender,
                       d.disease, d.conclusion, d.treatment_plan
                FROM Diagnosis d
                JOIN MedicineRecords m ON d.medicineRecord_id = m.medicineRecord_id
                JOIN Patient p ON p.patient_id = m.patient_id
                WHERE d.doctor_id = ?
            """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, doctor_id);
            ResultSet rs = statement.executeQuery();

            while (rs.next()) {
                DiagnosisDetails detail = new DiagnosisDetails(
                        rs.getString("full_name"),
                        rs.getDate("dob").toLocalDate(),
                        rs.getString("gender"),
                        rs.getString("disease"),
                        rs.getString("conclusion"),
                        rs.getString("treatment_plan")
                );
                list.add(detail);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return list.isEmpty() ? null : list;
    }

    public boolean updateOrCreateDiagnosis(int medicineRecordId, int doctorId, String conclusion, String disease, String treatmentPlan) {
        String sql = "IF EXISTS (SELECT 1 FROM Diagnosis WHERE medicineRecord_id = ?) " +
            "UPDATE Diagnosis SET conclusion = ?, disease = ?, treatment_plan = ? WHERE medicineRecord_id = ? " +
            "ELSE " +
            "INSERT INTO Diagnosis (doctor_id, medicineRecord_id, conclusion, disease, treatment_plan) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            // Cho trường hợp UPDATE
            ps.setInt(1, medicineRecordId);
            ps.setString(2, conclusion);
            ps.setString(3, disease);
            ps.setString(4, treatmentPlan);
            ps.setInt(5, medicineRecordId);
            
            // Cho trường hợp INSERT
            ps.setInt(6, doctorId);
            ps.setInt(7, medicineRecordId);
            ps.setString(8, conclusion);
            ps.setString(9, disease);
            ps.setString(10, treatmentPlan);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean createNewDiagnosis(int medicineRecordId, int doctorId, String conclusion, String disease, String treatmentPlan) throws SQLException {
        // Validate input parameters
        if (medicineRecordId <= 0 || doctorId <= 0) {
            throw new SQLException("Invalid medicineRecordId or doctorId");
        }
        
        if (conclusion == null || conclusion.trim().isEmpty() ||
            disease == null || disease.trim().isEmpty() ||
            treatmentPlan == null || treatmentPlan.trim().isEmpty()) {
            throw new SQLException("All fields (conclusion, disease, treatmentPlan) are required");
        }

        Connection conn = null;
        PreparedStatement ps = null;
        
        try {
            conn = DBContext.getInstance().getConnection();
            
            // First verify that the medicineRecord_id exists
            String checkSql = "SELECT 1 FROM MedicineRecords WHERE medicineRecord_id = ?";
            ps = conn.prepareStatement(checkSql);
            ps.setInt(1, medicineRecordId);
            ResultSet rs = ps.executeQuery();
            
            if (!rs.next()) {
                throw new SQLException("MedicineRecord not found with ID: " + medicineRecordId);
            }
            
            // Then verify that the doctor_id exists
            checkSql = "SELECT 1 FROM Doctor WHERE doctor_id = ?";
            ps = conn.prepareStatement(checkSql);
            ps.setInt(1, doctorId);
            rs = ps.executeQuery();
            
            if (!rs.next()) {
                throw new SQLException("Doctor not found with ID: " + doctorId);
            }
            
            // If both exist, proceed with insertion
            String sql = "INSERT INTO Diagnosis (doctor_id, medicineRecord_id, conclusion, disease, treatment_plan) VALUES (?, ?, ?, ?, ?)";
            ps = conn.prepareStatement(sql);
            
            ps.setInt(1, doctorId);
            ps.setInt(2, medicineRecordId);
            ps.setString(3, conclusion);
            ps.setString(4, disease);
            ps.setString(5, treatmentPlan);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error creating diagnosis: " + e.getMessage());
            throw e; // Re-throw the exception to be handled by the servlet
        } finally {
            if (ps != null) {
                try {
                    ps.close();
                } catch (SQLException e) {
                    System.err.println("Error closing PreparedStatement: " + e.getMessage());
                }
            }
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    System.err.println("Error closing Connection: " + e.getMessage());
                }
            }
        }
    }

    // Check if a diagnosis exists for a given medicineRecordId
    public boolean existsDiagnosisByMedicineRecordId(int medicineRecordId) {
        String sql = "SELECT 1 FROM Diagnosis WHERE medicineRecord_id = ?";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, medicineRecordId);
            ResultSet rs = ps.executeQuery();
            return rs.next();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
