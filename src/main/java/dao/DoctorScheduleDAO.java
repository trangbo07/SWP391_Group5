package dao;
import dto.DoctorDTO;
import dto.DoctorDetailsDTO;
import dto.DoctorScheduleDTO;

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

    public List<DoctorScheduleDTO> getScheduleNext7Days(int doctorId) {
        List<DoctorScheduleDTO> list = new ArrayList<>();
        DBContext db = DBContext.getInstance();
        String sql = """
            SELECT schedule_id, doctor_id, working_date, shift, room_id, is_available, note, admin_id
            FROM DoctorSchedule
            WHERE doctor_id = ?
            AND working_date BETWEEN DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
            AND DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
        """;

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, doctorId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                DoctorScheduleDTO schedule = new DoctorScheduleDTO(
                        rs.getInt("schedule_id"),
                        rs.getInt("doctor_id"),
                        rs.getString("working_date"),
                        rs.getString("shift"),
                        rs.getInt("room_id"),
                        rs.getInt("is_available"),
                        rs.getString("note"),
                        rs.getInt("admin_id")
                );
                list.add(schedule);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
}
