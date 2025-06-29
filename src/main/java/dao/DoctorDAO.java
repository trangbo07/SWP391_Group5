package dao;
import dto.DoctorDTO;
import dto.DoctorDetailsDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class DoctorDAO {



    public List<DoctorDTO> getAllDoctorDTOs() {
        List<DoctorDTO> list = new ArrayList<>();

        String sql = """
        SELECT doctor_id, full_name, department, eduLevel FROM Doctor d
                "JOIN AccountStaff a on d.doctor_id = a.account_staff_id
                "Where Status = 'Enable' 
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
                        "/assets/assets/images/doctor/" + rs.getInt("doctor_id") + ".webp" // ảnh tự động
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

}
