package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import dto.AdminBusinessDTO;

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

    public AdminBusinessDTO getAdminBusinessProfile(int accountStaffId) {
        String sql = """
            SELECT ab.admin_id, ab.account_staff_id, ab.full_name, ab.department, ab.phone,
                   acs.username, acs.email, acs.role, acs.img, acs.status
            FROM AdminBusiness ab
            INNER JOIN AccountStaff acs ON ab.account_staff_id = acs.account_staff_id
            WHERE ab.account_staff_id = ?
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, accountStaffId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                AdminBusinessDTO dto = new AdminBusinessDTO();
                dto.setAdminId(rs.getInt("admin_id"));
                dto.setAccountStaffId(rs.getInt("account_staff_id"));
                dto.setFullName(rs.getString("full_name"));
                dto.setDepartment(rs.getString("department"));
                dto.setPhone(rs.getString("phone"));
                dto.setUsername(rs.getString("username"));
                dto.setEmail(rs.getString("email"));
                dto.setRole(rs.getString("role"));
                dto.setImg(rs.getString("img"));
                dto.setStatus(rs.getString("status"));
                return dto;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public boolean updatePassword(int accountStaffId, String newPassword) {
        String sql = "UPDATE AccountStaff SET password = ? WHERE account_staff_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, newPassword);
            ps.setInt(2, accountStaffId);
            
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}