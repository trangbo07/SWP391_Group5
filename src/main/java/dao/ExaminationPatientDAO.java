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
            p.patient_id,
            p.full_name AS patient_name,
            p.dob,
            p.gender,
            p.phone AS patient_phone,
            p.address,
            mr.medicineRecord_id,
            er.exam_result_id,
            er.symptoms,
            er.preliminary_diagnosis,
  
            d.doctor_id,
            d.full_name AS doctor_name,
            d.department,
            d.phone AS doctor_phone,
            d.eduLevel
        FROM Patient p
        JOIN MedicineRecords mr ON p.patient_id = mr.patient_id
        JOIN ExamResult er ON mr.medicineRecord_id = er.medicineRecord_id
        JOIN Doctor d ON er.doctor_id = d.doctor_id
        WHERE p.patient_id = ?
  
    """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                ExaminationPatientDTO dto = new ExaminationPatientDTO();
                // Exam Result
                dto.setExamResultId(rs.getInt("exam_result_id"));
                dto.setSymptoms(rs.getString("symptoms"));
                dto.setPreliminaryDiagnosis(rs.getString("preliminary_diagnosis"));
                // Doctor
                dto.setDoctorId(rs.getInt("doctor_id"));
                dto.setDoctorName(rs.getString("doctor_name"));
                dto.setDepartment(rs.getString("department"));
                dto.setDoctorPhone(rs.getString("doctor_phone"));
                dto.setEduLevel(rs.getString("eduLevel"));

                // Patient
                dto.setPatientId(rs.getInt("patient_id"));
                dto.setPatientName(rs.getString("patient_name"));
                dto.setDob(rs.getString("dob"));
                dto.setGender(rs.getString("gender"));
                dto.setPatientPhone(rs.getString("patient_phone"));
                dto.setAddress(rs.getString("address"));

                results.add(dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return results;
    }
}
