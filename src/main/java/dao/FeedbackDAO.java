package dao;

import dto.PendingFeedbackDTO;
import model.*;

import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

public class FeedbackDAO {

    public List<PendingFeedbackDTO> getPendingFeedbackByAccountId(int accountPatientId) {
        List<PendingFeedbackDTO> list = new ArrayList<>();

        String sql = """
    
                SELECT DISTINCT
    	p.patient_id,
        d.doctor_id,
        d.full_name AS doctor_name,
        p.full_name AS patient_name,
        a.appointment_id,
        a.appointment_datetime
    FROM Appointment a
    JOIN Doctor d ON a.doctor_id = d.doctor_id
    JOIN Patient p ON a.patient_id = p.patient_id
    JOIN Patient_AccountPatient pa ON pa.patient_id = p.patient_id
    WHERE a.status = 'Completed'
      AND pa.account_patient_id = ?
      AND NOT EXISTS (
        SELECT 1
        FROM Feedback f
        WHERE f.patient_id = a.patient_id
          AND f.doctor_id = a.doctor_id
    )
    """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, accountPatientId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(new PendingFeedbackDTO(
                        rs.getInt("patient_id"),
                        rs.getInt("doctor_id"),
                        rs.getString("doctor_name"),
                        rs.getString("patient_name"),
                        rs.getInt("appointment_id"),
                        rs.getTimestamp("appointment_datetime") // <-- đã sửa chỗ này
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
    public boolean insertFeedback(int patientId, int doctorId, String content) {
        String insertSql = "INSERT INTO Feedback (patient_id, doctor_id, content, created_at) VALUES (?, ?, ?, GETDATE())";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {

            insertStmt.setInt(1, patientId);
            insertStmt.setInt(2, doctorId);
            insertStmt.setString(3, content);
            insertStmt.executeUpdate();

            System.out.println("✅ Feedback inserted thành công.");
            return true;

        } catch (SQLException e) {
            System.err.println("❌ Lỗi khi insert feedback: " + e.getMessage());
            return false;
        }
    }

    public boolean updateFeedbackById(int feedbackId, String newContent) {
        String sql = "UPDATE Feedback SET content = ?, created_at = GETDATE() WHERE feedback_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, newContent);
            stmt.setInt(2, feedbackId);

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                System.out.println("✅ Đã cập nhật feedback id = " + feedbackId);
                return true;
            } else {
                System.out.println("⚠️ Không tìm thấy feedback id = " + feedbackId + " để cập nhật.");
                return false;
            }

        } catch (SQLException e) {
            System.err.println("❌ Lỗi khi cập nhật feedback: " + e.getMessage());
            return false;
        }
    }
    public List<Feedback> getFeedback(int patientId) {
        String sql = """
            SELECT f.*, d.full_name AS doctor_name
                         FROM Feedback f JOIN Doctor d ON f.doctor_id = d.doctor_id
                         WHERE f.patient_id = ?
""";
        List<Feedback> feedbackList = new ArrayList<>();

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, patientId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Feedback feedback = new Feedback();
                feedback.setFeedback_id(rs.getInt("feedback_id"));
                feedback.setPatient_id(rs.getInt("patient_id"));
                feedback.setDoctor_id(rs.getInt("doctor_id"));
                feedback.setContent(rs.getString("content"));

                Timestamp createdAt = rs.getTimestamp("created_at");
                feedback.setCreated_at(createdAt);

                // ✅ Format thời gian thành chuỗi ISO để gửi về frontend
                if (createdAt != null) {
                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                    String formattedDate = formatter.format(createdAt);
                    feedback.setCreated_at_formatted(formattedDate);
                }

                feedback.setDoctor_name(rs.getString("doctor_name")); // ✅ gán tên bác sĩ
                feedbackList.add(feedback);
            }

        } catch (SQLException e) {
            System.err.println("❌ Lỗi khi lấy feedback: " + e.getMessage());
        }

        return feedbackList;
    }
        public List<Feedback> getFeedbackByAccountPatientId ( int accountPatientId){
            String sql = """
        SELECT 
            f.feedback_id, 
            f.content, 
            f.created_at, 
            d.full_name AS doctor_name, 
            d.department AS doctor_department, 
            d.phone AS doctor_phone, 
            d.eduLevel AS doctor_eduLevel, 
            p.patient_id 
        FROM Feedback f
        JOIN Doctor d ON d.doctor_id = f.doctor_id
        JOIN Patient_AccountPatient p ON f.patient_id = p.patient_id
        WHERE p.account_patient_id = ?
    """;

            List<Feedback> feedbackList = new ArrayList<>();

            try (Connection conn = DBContext.getInstance().getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {

                stmt.setInt(1, accountPatientId);
                ResultSet rs = stmt.executeQuery();

                while (rs.next()) {
                    Feedback feedback = new Feedback();
                    feedback.setFeedback_id(rs.getInt("feedback_id"));
                    feedback.setContent(rs.getString("content"));
                    feedback.setPatient_id(rs.getInt("patient_id"));

                    Timestamp createdAt = rs.getTimestamp("created_at");
                    feedback.setCreated_at(createdAt);

                    if (createdAt != null) {
                        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                        String formattedDate = formatter.format(createdAt);
                        feedback.setCreated_at_formatted(formattedDate);
                    }

                    feedback.setDoctor_name(rs.getString("doctor_name"));
                    feedback.setDoctor_department(rs.getString("doctor_department"));
                    feedback.setDoctor_phone(rs.getString("doctor_phone"));
                    feedback.setDoctor_eduLevel(rs.getString("doctor_eduLevel"));

                    feedbackList.add(feedback);
                }

            } catch (SQLException e) {
                System.err.println("❌ Lỗi khi lấy feedback theo account_patient_id: " + e.getMessage());
            }

            return feedbackList;
        }

}