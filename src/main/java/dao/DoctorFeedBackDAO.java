package dao;

import dto.TopFeedbackDTO;
import model.DiagnosisDetails;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.sql.*;

public class DoctorFeedBackDAO {

    public List<TopFeedbackDTO> getTop10DoctorFeedback() {
        List<TopFeedbackDTO> list = new ArrayList<>();
        DBContext db = DBContext.getInstance();

        try {
            String sql = """
                SELECT TOP 10
                    D.doctor_id,
                    D.full_name,
                    D.department,
                    D.phone,
                    D.eduLevel,
                    A.img,
                    F.content AS feedbackContent,
                    F.created_at
                FROM Doctor D
                JOIN AccountStaff A ON D.account_staff_id = A.account_staff_id
                JOIN Feedback F ON D.doctor_id = F.doctor_id
                WHERE A.status = 'Enable'
                AND F.created_at = (
                    SELECT MAX(created_at) FROM Feedback f2 WHERE f2.doctor_id = D.doctor_id
                )
                ORDER BY (
                    SELECT COUNT(*) FROM Feedback f3 WHERE f3.doctor_id = D.doctor_id
                ) DESC
            """;

            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                TopFeedbackDTO dto = new TopFeedbackDTO(
                        rs.getInt("doctor_id"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone"),
                        rs.getString("eduLevel"),
                        rs.getString("img"),
                        rs.getString("feedbackContent"),
                        rs.getString("created_at")  // hoặc format nếu muốn
                );
                list.add(dto);
            }
            System.out.println(list);
            rs.close();
            ps.close();

        } catch (Exception e) {
            e.printStackTrace(); // ✅ In lỗi ra console như bạn yêu cầu
            return null;
        }

        return list.isEmpty() ? null : list;
    }
}
