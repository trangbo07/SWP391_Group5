package dao;

import dto.PatientBookAppoinmentDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.ResultSet;
public class AppoinmentPatientDAO {

    public boolean insertAppointment(PatientBookAppoinmentDTO appointment) {
        String checkSql = "SELECT COUNT(*) FROM Appointment " +
                "WHERE doctor_id = ? AND patient_id = ? AND appointment_datetime = ?";

        String insertSql = "INSERT INTO Appointment (doctor_id, patient_id, appointment_datetime, receptionist_id, shift, note, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (
                Connection conn = DBContext.getInstance().getConnection();
                PreparedStatement checkStmt = conn.prepareStatement(checkSql);
                PreparedStatement insertStmt = conn.prepareStatement(insertSql)
        ) {
            // Kiểm tra xem đã đặt lịch chưa
            checkStmt.setInt(1, appointment.getDoctorId());
            checkStmt.setInt(2, appointment.getPatientId());
            checkStmt.setTimestamp(3, appointment.getAppointmentDatetime());

            ResultSet rs = checkStmt.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                System.err.println("❌ Lịch hẹn đã tồn tại cho bác sĩ, bệnh nhân, thời gian này.");
                return false; // Không cho đặt lại
            }

            // Tiến hành thêm mới
            insertStmt.setInt(1, appointment.getDoctorId());
            insertStmt.setInt(2, appointment.getPatientId());
            insertStmt.setTimestamp(3, appointment.getAppointmentDatetime());
            insertStmt.setInt(4, appointment.getReceptionistId());
            insertStmt.setString(5, appointment.getShift());
            insertStmt.setString(6, appointment.getNote());
            insertStmt.setString(7, appointment.getStatus() != null ? appointment.getStatus() : "Pending");

            int rowsAffected = insertStmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("❌ Lỗi khi thêm lịch hẹn: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
