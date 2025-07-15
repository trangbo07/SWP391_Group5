package dao;

import model.Patient;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PatientDAO {
    
    public List<Patient> getAllPatients() {
        List<Patient> patients = new ArrayList<>();
        String sql = "SELECT * FROM Patient ORDER BY full_name";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                patients.add(new Patient(
                    rs.getInt("patient_id"),
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
        
        return patients;
    }
    
    public Patient getPatientById(int patientId) {
        String sql = "SELECT * FROM Patient WHERE patient_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return new Patient(
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
    
    public Map<String, Object> getPatientInfoWithDiagnosis(int patientId) {
        Map<String, Object> patientInfo = new HashMap<>();
        
        // Lấy thông tin bệnh nhân
        String patientSql = "SELECT * FROM Patient WHERE patient_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(patientSql)) {
            
            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                patientInfo.put("patient_id", rs.getInt("patient_id"));
                patientInfo.put("patient_name", rs.getString("full_name"));
                patientInfo.put("dob", rs.getString("dob"));
                patientInfo.put("gender", rs.getString("gender"));
                patientInfo.put("phone", rs.getString("phone"));
                patientInfo.put("address", rs.getString("address"));
                
                // Lấy thông tin chẩn đoán mới nhất
                String diagnosisSql = """
                    SELECT TOP 1 mr.medicineRecord_id, d.disease, d.conclusion, d.treatment_plan
                    FROM MedicineRecords mr
                    LEFT JOIN Diagnosis d ON mr.medicineRecord_id = d.medicineRecord_id
                    WHERE mr.patient_id = ?
                    ORDER BY mr.medicineRecord_id DESC
                """;
                
                try (PreparedStatement diagPs = conn.prepareStatement(diagnosisSql)) {
                    diagPs.setInt(1, patientId);
                    ResultSet diagRs = diagPs.executeQuery();
                    
                    if (diagRs.next()) {
                        patientInfo.put("medicineRecord_id", diagRs.getInt("medicineRecord_id"));
                        patientInfo.put("diagnosis", diagRs.getString("disease"));
                        patientInfo.put("conclusion", diagRs.getString("conclusion"));
                        patientInfo.put("treatment_plan", diagRs.getString("treatment_plan"));
                    } else {
                        // Nếu không có chẩn đoán, tạo medicine record mới
                        String createRecordSql = "INSERT INTO MedicineRecords (patient_id) VALUES (?)";
                        try (PreparedStatement createPs = conn.prepareStatement(createRecordSql, Statement.RETURN_GENERATED_KEYS)) {
                            createPs.setInt(1, patientId);
                            int rowsAffected = createPs.executeUpdate();
                            
                            if (rowsAffected > 0) {
                                ResultSet generatedKeys = createPs.getGeneratedKeys();
                                if (generatedKeys.next()) {
                                    patientInfo.put("medicineRecord_id", generatedKeys.getInt(1));
                                    patientInfo.put("diagnosis", "");
                                    patientInfo.put("conclusion", "");
                                    patientInfo.put("treatment_plan", "");
                                }
                            }
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return patientInfo;
    }
    
    public List<Map<String, Object>> searchPatients(String keyword) {
        List<Map<String, Object>> patients = new ArrayList<>();
        String sql = """
            SELECT patient_id, full_name, phone, gender, dob 
            FROM Patient 
            WHERE full_name LIKE ? OR phone LIKE ?
            ORDER BY full_name
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            String searchKeyword = "%" + keyword + "%";
            ps.setString(1, searchKeyword);
            ps.setString(2, searchKeyword);
            
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> patient = new HashMap<>();
                patient.put("patient_id", rs.getInt("patient_id"));
                patient.put("full_name", rs.getString("full_name"));
                patient.put("phone", rs.getString("phone"));
                patient.put("gender", rs.getString("gender"));
                patient.put("dob", rs.getString("dob"));
                patients.add(patient);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return patients;
    }
    
    public boolean updatePatient(Patient patient) {
        String sql = "UPDATE Patient SET full_name = ?, dob = ?, gender = ?, phone = ?, address = ? WHERE patient_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, patient.getFull_name());
            ps.setString(2, patient.getDob());
            ps.setString(3, patient.getGender());
            ps.setString(4, patient.getPhone());
            ps.setString(5, patient.getAddress());
            ps.setInt(6, patient.getPatient_id());
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public int createPatient(Patient patient) {
        String sql = "INSERT INTO Patient (full_name, dob, gender, phone, address) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            ps.setString(1, patient.getFull_name());
            ps.setString(2, patient.getDob());
            ps.setString(3, patient.getGender());
            ps.setString(4, patient.getPhone());
            ps.setString(5, patient.getAddress());
            
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
} 