package dao;
import dto.DoctorDTO;
import dto.DoctorDetailsDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;


public class DoctorScheduleDAO {
    public boolean checkScheduleExists(int doctorId, String workingDate, String shift) {
        DBContext db = DBContext.getInstance();
        String sql = "SELECT 1 FROM DoctorSchedule WHERE doctor_id = ? AND working_date = ? AND shift = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, doctorId);
            ps.setString(2, workingDate);
            ps.setString(3, shift);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // Lấy danh sách các ngày giờ hẹn sắp tới của bác sĩ
//    public List<Timestamp> getUpcomingAppointmentsByDoctorId(int doctorId) throws SQLException {
//        List<Timestamp> result = new ArrayList<>();
//        DBContext db = DBContext.getInstance();
//        String sql = "SELECT DISTINCT ap.appointment_datetime " +
//                "FROM Doctor d " +
//                "JOIN Appointment ap ON d.doctor_id = ap.doctor_id " +
//                "JOIN DoctorSchedule ds ON d.doctor_id = ds.doctor_id " +
//                "JOIN AccountStaff ac ON d.account_staff_id = ac.account_staff_id " +
//                "WHERE ds.is_available = 1 " +
//                "AND ds.doctor_id = ? " +
//                "AND ap.appointment_datetime > GETDATE() " +
//                "ORDER BY ap.appointment_datetime";
//        try (Connection conn = DBContext.getConnection();
//             PreparedStatement ps = conn.prepareStatement(sql)) {
//            ps.setInt(1, doctorId);
//            try (ResultSet rs = ps.executeQuery()) {
//                while (rs.next()) {
//                    result.add(rs.getTimestamp("appointment_datetime"));
//                }
//            }
//        }
//        return result;
//    }
}
