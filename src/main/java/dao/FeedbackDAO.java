package dao;

import model.*;

import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

public class FeedbackDAO {

    public boolean insertFeedback(int patientId, int doctorId, String content) {
        String checkSql = "SELECT COUNT(*) FROM Feedback WHERE patient_id = ? AND doctor_id = ?";
        String insertSql = "INSERT INTO Feedback (patient_id, doctor_id, content, created_at) VALUES (?, ?, ?, GETDATE())";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {

            // Kiểm tra xem feedback đã tồn tại chưa
            checkStmt.setInt(1, patientId);
            checkStmt.setInt(2, doctorId);
            ResultSet rs = checkStmt.executeQuery();

            if (rs.next() && rs.getInt(1) > 0) {
                System.out.println("⚠️ Feedback đã tồn tại cho bệnh nhân và bác sĩ này.");
                return false;
            }

            // Nếu chưa tồn tại, thực hiện insert
            try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                insertStmt.setInt(1, patientId);
                insertStmt.setInt(2, doctorId);
                insertStmt.setString(3, content);
                insertStmt.executeUpdate();
                return true;
            }

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
}