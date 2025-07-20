package dao;

import dto.AppointmentDTO;
import dto.AppointmentpatientDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.sql.SQLException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class PatientAppointmentDAO {
    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<AppointmentpatientDTO> getAppointmentsByPatientId(int patientId) {
        List<AppointmentpatientDTO> list = new ArrayList<>();
        String sql = """
            
                SELECT a.appointment_id,
                   a.appointment_datetime,
                   a.shift,
                   a.status,
                   a.note,
                   p.full_name
            FROM Appointment a
            JOIN Patient p ON p.patient_id = a.patient_id
            JOIN Patient_AccountPatient pap ON pap.patient_id = p.patient_id
            WHERE pap.account_patient_id = ?
            ORDER BY a.appointment_datetime DESC;
            """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Timestamp ts = rs.getTimestamp("appointment_datetime");
                String dtStr = ts == null
                        ? ""
                        : ts.toLocalDateTime().format(FMT);

                AppointmentpatientDTO dto = new AppointmentpatientDTO();
                dto.setPatientId(patientId);
                dto.setAppointmentId(rs.getInt("appointment_id"));
                dto.setDoctorName(rs.getString("full_name"));
                dto.setDateTime(dtStr);
                dto.setShift(rs.getString("shift"));
                dto.setEduLevel(rs.getString("eduLevel"));
                dto.setStatus(rs.getString("status"));
                dto.setNote(rs.getString("note"));
                list.add(dto);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean cancelAppointmentById(int appointmentId, int patientId) {
        String sql = """
            UPDATE Appointment
               SET status = 'Cancelled'
             WHERE appointment_id = ?
            """;
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, appointmentId);
            return ps.executeUpdate() == 1;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<AppointmentpatientDTO> getByPatientAndStatus(int patientId, String status) {
        List<AppointmentpatientDTO> list = new ArrayList<>();
        String sql = """
    SELECT
        a.appointment_id,
        a.appointment_datetime,
        a.shift,
        a.status,
        a.note,
        d.full_name AS doctor_name,
        d.eduLevel  AS eduLevel,
        ap.account_patient_id,
        ap.username,
        ap.email
    FROM Appointment a
    JOIN Doctor d ON d.doctor_id = a.doctor_id
    JOIN Patient_AccountPatient pap ON pap.patient_id = a.patient_id
    JOIN AccountPatient ap ON ap.account_patient_id = pap.account_patient_id
    WHERE ap.account_patient_id = ?
      AND a.status = ?
    ORDER BY a.appointment_datetime DESC
    """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt   (1, patientId);
            ps.setString(2, status);
            
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Timestamp ts = rs.getTimestamp("appointment_datetime");
                String dtStr = ts == null
                        ? ""
                        : ts.toLocalDateTime().format(FMT);

                AppointmentpatientDTO dto = new AppointmentpatientDTO();
                dto.setPatientId(patientId);
                dto.setAppointmentId(rs.getInt("appointment_id"));
                dto.setDoctorName(rs.getString("doctor_name"));
                dto.setDateTime(dtStr);
                dto.setShift(rs.getString("shift"));
                dto.setEduLevel(rs.getString("eduLevel"));
                dto.setStatus(rs.getString("status"));
                dto.setNote(rs.getString("note"));
                list.add(dto);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public AppointmentpatientDTO getAppointmentDetailById(int appointmentId, int patientId) {
        String sql = """
            SELECT a.appointment_id,
                   a.patient_id,
                   p.full_name      AS patient_name,
                   p.dob,
                   p.gender,
                   p.phone,
                   d.full_name      AS doctor_name,
                   a.appointment_datetime,
                   a.shift,
                   d.eduLevel,
                   a.status,
                   a.note
            FROM Appointment a
            JOIN Patient p ON p.patient_id = a.patient_id
            JOIN Waitlist w ON w.doctor_id = a.doctor_id
            JOIN Doctor   d ON d.doctor_id = w.doctor_id
            WHERE a.appointment_id = ?
              AND a.patient_id     = ?
            """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, appointmentId);
            ps.setInt(2, patientId);
            
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                Timestamp ts = rs.getTimestamp("appointment_datetime");
                String dtStr = ts == null
                        ? ""
                        : ts.toLocalDateTime().format(FMT);

                AppointmentpatientDTO dto = new AppointmentpatientDTO();
                dto.setPatientId(rs.getInt("patient_id"));
                dto.setAppointmentId(rs.getInt("appointment_id"));
                dto.setDoctorName(rs.getString("doctor_name"));
                dto.setDateTime(dtStr);
                dto.setShift(rs.getString("shift"));
                dto.setEduLevel(rs.getString("eduLevel"));
                dto.setStatus(rs.getString("status"));
                dto.setNote(rs.getString("note"));
                
                // Thêm thông tin patient
                dto.setPatientName(rs.getString("patient_name"));
                dto.setDob(rs.getString("dob"));
                dto.setGender(rs.getString("gender"));
                dto.setPhone(rs.getString("phone"));
                
                return dto;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
