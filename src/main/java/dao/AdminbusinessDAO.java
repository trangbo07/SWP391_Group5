package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AdminbusinessDAO {
    public boolean checkScheduleDuplicate(int doctorId, String date, String shift) {
        String sql = """
            SELECT 1
            FROM DoctorSchedule
            WHERE doctor_id = ? AND working_date = ? AND shift = ?
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, doctorId);
            ps.setString(2, date);
            ps.setString(3, shift);

            return ps.executeQuery().next(); // nếu có bản ghi => trùng
        } catch (Exception e) {
            e.printStackTrace();
            return true; // xử lý an toàn
        }
    }

    public boolean insertSchedule(int doctorId, String date, String shift, int roomId, String note, Integer adminId) {
        System.out.println("Insert: " + doctorId + ", " + date + ", " + shift + ", " + roomId + ", " + note + ", " +  adminId);
        String sql = """ 
                INSERT INTO DoctorSchedule
                (doctor_id, working_date, shift, room_id, is_available, note, admin_id)
                VALUES (?, ?, ?, ?, 1, ?, ?)
                """;

        try (Connection conn = DBContext.getInstance().getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, doctorId);
            ps.setString(2, date);
            ps.setString(3, shift);
            ps.setInt(4, roomId);
            ps.setString(5, note);
            ps.setInt(6, adminId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Insert failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    public Integer getAdminIdByAccountStaffId(int accountStaffId) {
    String sql = "SELECT admin_id FROM AdminBusiness WHERE account_staff_id = ?";
    try (Connection conn = DBContext.getInstance().getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setInt(1, accountStaffId);
        ResultSet rs = ps.executeQuery();
        if (rs.next()) {
            return rs.getInt("admin_id");
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
    return null;
}
}