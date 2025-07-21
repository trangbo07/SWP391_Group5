package dao;
import dto.DoctorDTO;
import dto.DoctorDetailsDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class DoctorDAO {

    public static List<DoctorDTO> getDoctorsWithUpcomingSchedule() {
        List<DoctorDTO> list = new ArrayList<>();

        String sql = """
         SELECT DISTINCT d.doctor_id, d.full_name, d.department, d.eduLevel, d.phone, ac.email, ac.role, ac.img
         FROM Doctor d
         JOIN AccountStaff ac ON d.account_staff_id = ac.account_staff_id
         WHERE ac.Status = 'Enable'
           AND EXISTS (
               SELECT 1
               FROM DoctorSchedule ds
               WHERE ds.doctor_id = d.doctor_id
                 AND ds.is_available = 1
                 AND ds.working_date > CAST(GETDATE() AS DATE)
           )
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                DoctorDTO dto = new DoctorDTO(
                        rs.getInt("doctor_id"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("eduLevel"),
                        rs.getString("img"),
                        rs.getString("phone"),
                        rs.getString("email"),
                        rs.getString("role")
                );
                list.add(dto);
            }

        } catch (Exception e) {
            System.err.println("Error in getAllDoctorDTOs: " + e.getMessage());
            e.printStackTrace();
        }

        return list;
    }
    public List<DoctorDTO> getAllDoctorDTOs() {
        List<DoctorDTO> list = new ArrayList<>();

        String sql = """
        SELECT d.doctor_id, d.full_name, d.department, d.eduLevel, d.phone, a.email, a.role ,a.img
        FROM Doctor d
        JOIN AccountStaff a on d.account_staff_id = a.account_staff_id
        WHERE a.Status = 'Enable' 
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                DoctorDTO dto = new DoctorDTO(
                        rs.getInt("doctor_id"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("eduLevel"),
                        rs.getString("img"),
                        rs.getString("phone"),
                        rs.getString("email"),
                        rs.getString("role")
                );
                list.add(dto);
            }

        } catch (Exception e) {
            System.err.println("Error in getAllDoctorDTOs: " + e.getMessage());
            e.printStackTrace();
        }

        return list;
    }


    public DoctorDetailsDTO getDoctorDetailsByAccountStaffId(int accountStaffId) {
        DoctorDetailsDTO dto = null;

        String sql = "SELECT d.full_name, d.phone, d.department, d.eduLevel, " +
                "a.username, a.role, a.email, a.img " +
                "FROM doctor d " +
                "JOIN AccountStaff a ON d.account_staff_id = a.account_staff_id " +
                "WHERE a.account_staff_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, accountStaffId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    dto = new DoctorDetailsDTO(
                            rs.getString("full_name"),
                            rs.getString("phone"),
                            rs.getString("department"),
                            rs.getString("eduLevel"),
                            rs.getString("username"),
                            rs.getString("role"),
                            rs.getString("email"),
                            rs.getString("img")
                    );
                }
            }

        } catch (Exception e) {
            System.err.println("Error in getDoctorDetailsByAccountStaffId: " + e.getMessage());
            e.printStackTrace();
        }

        return dto;
    }

    public List<String> getAllDepartments() {
        List<String> departments = new ArrayList<>();
        String sql = "SELECT DISTINCT department FROM Doctor";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                departments.add(rs.getString("department"));
            }
        } catch (Exception e) {
            System.err.println("Error in getAllDepartments: " + e.getMessage());
            e.printStackTrace();
        }
        return departments;
    }

    public DoctorDTO getDoctorDTOById(int doctorId) {
        String sql = """
                SELECT d.doctor_id, d.full_name, d.department, d.eduLevel, d.phone, a.email, a.role , a.img
                FROM Doctor d
                JOIN AccountStaff a on d.account_staff_id = a.account_staff_id
                WHERE d.doctor_id = ? AND a.Status = 'Enable'
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, doctorId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new DoctorDTO(
                            rs.getInt("doctor_id"),
                            rs.getString("full_name"),
                            rs.getString("department"),
                            rs.getString("eduLevel"),
                           rs.getString("img"),
                            rs.getString("phone"),
                            rs.getString("email"),
                            rs.getString("role")
                    );
                }
            }

        } catch (Exception e) {
            System.err.println("Error in getDoctorDTOById: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }
public boolean updateDoctorImage(int accountStaffId, String imageUrl) {
    String sql = "UPDATE AccountStaff SET img = ? WHERE account_staff_id = ?";

    try (Connection conn = DBContext.getInstance().getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setString(1, imageUrl);
        ps.setInt(2, accountStaffId);

        int rowsAffected = ps.executeUpdate();
        return rowsAffected > 0;

    } catch (Exception e) {
        System.err.println("Error in updateDoctorImage: " + e.getMessage());
        e.printStackTrace();
        return false;
    }
}
}