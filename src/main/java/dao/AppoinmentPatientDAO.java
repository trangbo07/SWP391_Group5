package dao;

import dto.PatientBookAppoinmentDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.ResultSet;

public class AppoinmentPatientDAO {

    public boolean insertAppointment(PatientBookAppoinmentDTO appointment) {


        String checkPendingSql = "SELECT COUNT(*) FROM Appointment " +
                "WHERE doctor_id = ? AND status = 'Pending' " +
                "AND CONVERT(VARCHAR(16), appointment_datetime, 120) = CONVERT(VARCHAR(16), ?, 120)";


        String checkPatientHistorySql = """
                SELECT COUNT(*) FROM Appointment 
                WHERE doctor_id = ? AND patient_id = ? 
                AND CONVERT(VARCHAR(16), appointment_datetime, 120) = CONVERT(VARCHAR(16), ?, 120)
                """;


        String insertSql = "INSERT INTO Appointment (doctor_id, patient_id, appointment_datetime, receptionist_id, shift, note, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        System.out.println("Day la " + appointment.getPatientId());
        try (
                Connection conn = DBContext.getInstance().getConnection();
                PreparedStatement checkPendingStmt = conn.prepareStatement(checkPendingSql);
                PreparedStatement checkHistoryStmt = conn.prepareStatement(checkPatientHistorySql);
                PreparedStatement insertStmt = conn.prepareStatement(insertSql)
        ) {
            // Chuẩn hóa timestamp (xóa nano)
            Timestamp timestamp = appointment.getAppointmentDatetime();
            if (timestamp != null) timestamp.setNanos(0);


            checkPendingStmt.setInt(1, appointment.getDoctorId());
            checkPendingStmt.setTimestamp(2, timestamp);
            ResultSet rsPending = checkPendingStmt.executeQuery();
            if (rsPending.next() && rsPending.getInt(1) > 0) {
                System.err.println("❌ Slot đã có người đặt (Pending). Không thể đặt.");
                return false;
            }


            checkHistoryStmt.setInt(1, appointment.getDoctorId());
            checkHistoryStmt.setInt(2, appointment.getPatientId());
            checkHistoryStmt.setTimestamp(3, timestamp);
            ResultSet rsHistory = checkHistoryStmt.executeQuery();
            if (rsHistory.next() && rsHistory.getInt(1) > 0) {
                System.err.println("❌ Bệnh nhân này đã từng đặt lịch với bác sĩ này vào giờ này rồi.");
                return false;
            }


            insertStmt.setInt(1, appointment.getDoctorId());
            insertStmt.setInt(2, appointment.getPatientId());
            insertStmt.setTimestamp(3, timestamp);
            insertStmt.setInt(4, appointment.getReceptionistId());
            insertStmt.setString(5, appointment.getShift() != null ? appointment.getShift() : "Sáng");
            insertStmt.setString(6, appointment.getNote() != null ? appointment.getNote() : "");
            insertStmt.setString(7, appointment.getStatus() != null ? appointment.getStatus() : "Pending");

            int rowsAffected = insertStmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("❌ Lỗi khi thêm lịch hẹn: " + e.getMessage());
            return false;
        }
    }

    public int countPendingAppointmentsByPatient(int patientId) {
        String sql = "SELECT COUNT(*) FROM Appointment WHERE patient_id = ? AND status = 'Pending'";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt(1);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }
}
