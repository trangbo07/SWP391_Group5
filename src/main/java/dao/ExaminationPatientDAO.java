package dao;

import dto.ExaminationPatientDTO;
import model.ExamResult;
import dao.DBContext;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ExaminationPatientDAO {
    
    public List<ExaminationPatientDTO> getExaminationResultsByPatientId(int patientId) {
        List<ExaminationPatientDTO> results = new ArrayList<>();
        String sql = """
            SELECT
                er.exam_result_id,
                d.full_name AS NameDoctor,
                er.symptoms,
                er.preliminary_diagnosis
            FROM AccountPatient ap
            JOIN Patient_AccountPatient pap ON ap.account_patient_id = pap.account_patient_id
            JOIN Patient p ON pap.patient_id = p.patient_id
            JOIN MedicineRecords mr ON p.patient_id = mr.patient_id
            JOIN ExamResult er ON er.medicineRecord_id = mr.medicineRecord_id
            JOIN Doctor d ON er.doctor_id = d.doctor_id
            WHERE ap.account_patient_id = ?
            ORDER BY er.exam_result_id DESC;
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                ExaminationPatientDTO dto = new ExaminationPatientDTO();
                dto.setExamResultId(rs.getInt("exam_result_id"));
                dto.setDoctorName(rs.getString("NameDoctor"));
                dto.setSymptoms(rs.getString("symptoms"));
                dto.setPreliminaryDiagnosis(rs.getString("preliminary_diagnosis"));
                results.add(dto);
            }
            System.out.println(results);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return results;
    }
    
    public ExaminationPatientDTO getLatestExaminationResultByPatientId(int patientId) {
        String sql = """
            SELECT 
                er.exam_result_id,
                d.full_name as NameDoctor,
                er.symptoms,
                er.preliminary_diagnosis
            FROM ExamResult er
            JOIN MedicineRecords mr ON er.medicineRecord_id = mr.medicineRecord_id
            JOIN Doctor d ON er.doctor_id = d.doctor_id
            JOIN AccountPatient p ON mr.patient_id = p.account_patient_id
            WHERE p.account_patient_id = ?
            ORDER BY er.exam_result_id DESC
            LIMIT 1
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                ExaminationPatientDTO dto = new ExaminationPatientDTO();
                dto.setExamResultId(rs.getInt("exam_result_id"));
                dto.setDoctorName(rs.getString("NameDoctor"));
                dto.setSymptoms(rs.getString("symptoms"));
                dto.setPreliminaryDiagnosis(rs.getString("preliminary_diagnosis"));
                
                return dto;
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return null;
    }
}
