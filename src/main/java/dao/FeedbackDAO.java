package dao;

import model.*;

import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

public class FeedbackDAO {

    // Chỉ giữ lại các hàm thao tác với các trường có thật trong bảng Feedback
    public boolean insertFeedback(int patientId, String content) {
        String insertSql = "INSERT INTO Feedback (patient_id, content, created_at) VALUES (?, ?, GETDATE())";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
            insertStmt.setInt(1, patientId);
            insertStmt.setString(2, content);
            insertStmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("❌ Insert feedback failed: " + e.getMessage());
            return false;
        }
    }
    public boolean updateFeedback(int patientId, int doctorId, String newContent) {
        String checkSql = "SELECT COUNT(*) FROM Feedback WHERE patient_id = ? AND doctor_id = ?";
        String updateSql = "UPDATE Feedback SET content = ?, created_at = GETDATE() WHERE patient_id = ? AND doctor_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {

            // Kiểm tra xem feedback có tồn tại không
            checkStmt.setInt(1, patientId);
            checkStmt.setInt(2, doctorId);
            ResultSet rs = checkStmt.executeQuery();

            if (rs.next() && rs.getInt(1) > 0) {
                // Nếu tồn tại, cập nhật nội dung
                try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                    updateStmt.setString(1, newContent);
                    updateStmt.setInt(2, patientId);
                    updateStmt.setInt(3, doctorId);
                    updateStmt.executeUpdate();
                    return true;
                }
            } else {
                System.out.println("⚠️ Không tìm thấy feedback để cập nhật.");
                return false;
            }

        } catch (SQLException e) {
            System.err.println("❌ Update feedback failed: " + e.getMessage());
            return false;
        }
    }
    public List<Feedback> getFeedback(int patientId) {
        String sql = "SELECT f.*, p.full_name AS patient_name FROM Feedback f JOIN Patient p ON f.patient_id = p.patient_id WHERE f.patient_id = ?";
        List<Feedback> feedbackList = new ArrayList<>();
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, patientId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Feedback feedback = new Feedback();
                feedback.setFeedback_id(rs.getInt("feedback_id"));
                feedback.setPatient_id(rs.getInt("patient_id"));
                feedback.setContent(rs.getString("content"));
                Timestamp createdAt = rs.getTimestamp("created_at");
                feedback.setCreated_at(createdAt);
                if (createdAt != null) {
                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                    String formattedDate = formatter.format(createdAt);
                    feedback.setCreated_at_formatted(formattedDate);
                }
                feedback.setDoctor_name(rs.getString("patient_name")); // Tạm dùng doctor_name để chứa patient_name
                feedbackList.add(feedback);
            }
        } catch (SQLException e) {
            System.err.println("❌ Lỗi khi lấy feedback: " + e.getMessage());
        }
        return feedbackList;
    }
}