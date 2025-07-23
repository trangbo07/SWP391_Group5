package dao;

import model.Feedback;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

public class AdminFeedbackDAO {
    public List<Feedback> getAllFeedbackWithPatient() {
        String sql = "SELECT f.*, p.full_name AS patient_name FROM Feedback f JOIN Patient p ON f.patient_id = p.patient_id ORDER BY f.created_at DESC";
        List<Feedback> feedbackList = new ArrayList<>();
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Feedback feedback = new Feedback();
                feedback.setFeedback_id(rs.getInt("feedback_id"));
                feedback.setPatient_id(rs.getInt("patient_id"));
                feedback.setContent(rs.getString("content"));
                Timestamp createdAt = rs.getTimestamp("created_at");
                feedback.setCreated_at(createdAt);
                if (createdAt != null) {
                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String formattedDate = formatter.format(createdAt);
                    feedback.setCreated_at_formatted(formattedDate);
                }
                feedback.setDoctor_name(rs.getString("patient_name")); // Tạm dùng doctor_name để chứa patient_name
                feedbackList.add(feedback);
            }
        } catch (SQLException e) {
            System.err.println("Lỗi khi lấy feedback: " + e.getMessage());
        }
        return feedbackList;
    }
} 