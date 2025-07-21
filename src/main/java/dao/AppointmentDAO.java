package dao;

import dto.AppointmentDTO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class AppointmentDAO {
    public List<AppointmentDTO> getAppointmentByDoctorIDUpcomming(int doctor_id, String currentime) {
        DBContext db = DBContext.getInstance();
        List<AppointmentDTO> appointments = new ArrayList<>();

        try {
            String sql = """    
                     SELECT a.*, p.full_name, p.dob, p.gender, p.phone
                     FROM Appointment a
                     JOIN Patient p ON a.patient_id = p.patient_id
                     WHERE doctor_id = ? AND status = 'Pending'
                       AND appointment_datetime >= ?
                     ORDER BY appointment_datetime ASC;
                    """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, doctor_id);
            statement.setString(2, currentime);

            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                AppointmentDTO appointmentDTO =  null;
                appointmentDTO = new AppointmentDTO(
                        rs.getInt("appointment_id"),
                        rs.getString("appointment_datetime"),
                        rs.getString("shift"),
                        rs.getString("status"),
                        rs.getString("note"),
                        rs.getInt("patient_id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone")
                );
                appointments.add(appointmentDTO);
            }
        } catch (Exception e) {
            return null;
        }

        if (appointments.isEmpty()) {
            return null;
        } else {
            return appointments;
        }
    }

    public List<AppointmentDTO> getAppointmentByDoctorIDWithStatus(int doctor_id, String status) {
        DBContext db = DBContext.getInstance();
        List<AppointmentDTO> appointments = new ArrayList<>();

        try {
            String sql = """
                    SELECT a.*, p.full_name, p.dob, p.gender, p.phone
                    FROM Appointment a
                    JOIN Patient p ON a.patient_id = p.patient_id
                    WHERE doctor_id = ? AND status = ?
                    ORDER BY appointment_datetime DESC;
                    """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, doctor_id);
            statement.setString(2, status);

            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                AppointmentDTO appointmentDTO =  null;
                appointmentDTO = new AppointmentDTO(
                        rs.getInt("appointment_id"),
                        rs.getString("appointment_datetime"),
                        rs.getString("shift"),
                        rs.getString("status"),
                        rs.getString("note"),
                        rs.getInt("patient_id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone")
                );
                appointments.add(appointmentDTO);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return appointments.isEmpty() ? null : appointments;
    }

    public List<AppointmentDTO> getAppointmentsTodayByDoctorID(int doctor_id, String currentDateOnly) {
        DBContext db = DBContext.getInstance();
        List<AppointmentDTO> appointments = new ArrayList<>();

        try {
            String sql = """
                    SELECT a.*, p.full_name, p.dob, p.gender, p.phone
                    FROM Appointment a
                    JOIN Patient p ON a.patient_id = p.patient_id
                    WHERE doctor_id = ? 
                      AND CONVERT(date, appointment_datetime) = CONVERT(date, ?)
                    ORDER BY appointment_datetime DESC;
                    """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, doctor_id);
            statement.setString(2, currentDateOnly); // Format: "2025-06-18"

            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                AppointmentDTO appointment = new AppointmentDTO(
                        rs.getInt("appointment_id"),
                        rs.getString("appointment_datetime"),
                        rs.getString("shift"),
                        rs.getString("status"),
                        rs.getString("note"),
                        rs.getInt("patient_id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone")
                );
                appointments.add(appointment);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return appointments.isEmpty() ? null : appointments;
    }

    public AppointmentDTO getAppointmentDetailWithAppointmentById(int appointmentId) {
        DBContext db = DBContext.getInstance();
        AppointmentDTO appointmentDTO = null;

        try {
            String sql = """
                        SELECT a.*, p.full_name, p.dob, p.gender, p.phone
                        FROM Appointment a
                        JOIN Patient p ON a.patient_id = p.patient_id
                        WHERE a.appointment_id = ?
                    """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, appointmentId);
            ResultSet rs = statement.executeQuery();

            if (rs.next()) {
                appointmentDTO = new AppointmentDTO(
                        rs.getInt("appointment_id"),
                        rs.getString("appointment_datetime"),
                        rs.getString("shift"),
                        rs.getString("status"),
                        rs.getString("note"),
                        rs.getInt("patient_id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone")
                );
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return appointmentDTO;
    }

 // Hàm mới đơn giản để lấy thông tin cơ bản của appointment
    public AppointmentDTO getAppointmentBasicInfo(int appointmentId) {
        DBContext db = DBContext.getInstance();
        AppointmentDTO appointmentDTO = null;

        try {
            String sql = "SELECT appointment_id, doctor_id, patient_id, appointment_datetime FROM Appointment WHERE appointment_id = ?";

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, appointmentId);
            ResultSet rs = statement.executeQuery();

            if (rs.next()) {
                appointmentDTO = new AppointmentDTO();
                appointmentDTO.setAppointment_id(rs.getInt("appointment_id"));
                appointmentDTO.setDoctor_id(rs.getInt("doctor_id"));
                appointmentDTO.setPatient_id(rs.getInt("patient_id"));
                appointmentDTO.setAppointment_datetime(rs.getString("appointment_datetime"));
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return appointmentDTO;
    }

    public boolean cancelAppointmentById(int appointmentId) {
        DBContext db = DBContext.getInstance();
        String sql = "UPDATE Appointment SET status = 'Cancelled' WHERE appointment_id = ?";

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, appointmentId);
            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateAppointmentStatus(int appointmentId, String status) {
        DBContext db = DBContext.getInstance();
        String sql = "UPDATE Appointment SET status = ? WHERE appointment_id = ?";

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, appointmentId);
            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<AppointmentDTO> searchAppointmentsByKeyword(int doctorId, String keyword, String status) {
        DBContext db = DBContext.getInstance();
        List<AppointmentDTO> appointments = new ArrayList<>();

        try {
            String sql = """
            SELECT a.*, p.full_name, p.dob, p.gender, p.phone
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ?
              AND a.status = ?
              AND (
                REPLACE(p.full_name, ' ', '') COLLATE Latin1_General_CI_AI LIKE ?
                OR REPLACE(a.shift, ' ', '') COLLATE Latin1_General_CI_AI LIKE ?
                OR REPLACE(a.note, ' ', '') COLLATE Latin1_General_CI_AI LIKE ?
              )
            ORDER BY a.appointment_datetime DESC;
        """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            String likeKeyword = "%" + normalizeKeyword(keyword)  + "%";
            statement.setInt(1, doctorId);
            statement.setString(2, status);
            statement.setString(3, likeKeyword);
            statement.setString(4, likeKeyword);
            statement.setString(5, likeKeyword);

            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                AppointmentDTO appointment = new AppointmentDTO(
                        rs.getInt("appointment_id"),
                        rs.getString("appointment_datetime"),
                        rs.getString("shift"),
                        rs.getString("status"),
                        rs.getString("note"),
                        rs.getInt("patient_id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone")
                );
                appointments.add(appointment);
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return appointments.isEmpty() ? null : appointments;
    }

    public static String normalizeKeyword(String input) {
        if (input == null) return "";
        input = input.trim().replaceAll("\\s+", " "); // loại bỏ khoảng trắng thừa
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").replaceAll(" ", "");
    }

    public boolean createAppointment(int doctorId, int patientId, int receptionistId, 
                                   String appointmentDateTime, String shift, String note) {
        DBContext db = DBContext.getInstance();
        String sql = """
            INSERT INTO Appointment (doctor_id, patient_id, receptionist_id, appointment_datetime, shift, status, note)
            VALUES (?, ?, ?, ?, ?, 'Pending', ?)
        """;

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, doctorId);
            ps.setInt(2, patientId);
            ps.setInt(3, receptionistId);
            ps.setString(4, appointmentDateTime);
            ps.setString(5, shift);
            ps.setString(6, note);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public int createAppointmentWithId(int doctorId, int patientId, int receptionistId, 
                                      String appointmentDateTime, String shift, String note) {
        DBContext db = DBContext.getInstance();
        String sql = """
            INSERT INTO Appointment (doctor_id, patient_id, receptionist_id, appointment_datetime, shift, status, note)
            VALUES (?, ?, ?, ?, ?, 'Pending', ?)
        """;

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql, 
                                   PreparedStatement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, doctorId);
            ps.setInt(2, patientId);
            ps.setInt(3, receptionistId);
            ps.setString(4, appointmentDateTime);
            ps.setString(5, shift);
            ps.setString(6, note);

            int affectedRows = ps.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        return generatedKeys.getInt(1);
                    }
                }
            }
            return -1;
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public List<AppointmentDTO> getAllAppointmentsWithDetails() {
        DBContext db = DBContext.getInstance();
        List<AppointmentDTO> appointments = new ArrayList<>();

        try {
            String sql = """
                SELECT 
                    a.appointment_id,
                    a.appointment_datetime,
                    a.shift,
                    a.status,
                    a.note,
                    a.patient_id,
                    p.full_name AS patient_name,
                    p.dob,
                    p.gender,
                    p.phone,
                    d.full_name AS doctor_name,
                    d.department AS doctor_department
                FROM Appointment a
                JOIN Patient p ON a.patient_id = p.patient_id
                JOIN Doctor d ON a.doctor_id = d.doctor_id
                ORDER BY a.appointment_datetime ASC
            """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            ResultSet rs = statement.executeQuery();

            while (rs.next()) {
                AppointmentDTO appointment = new AppointmentDTO(
                        rs.getInt("appointment_id"),
                        rs.getString("appointment_datetime"),
                        rs.getString("shift"),
                        rs.getString("status"),
                        rs.getString("note"),
                        rs.getInt("patient_id"),
                        rs.getString("patient_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone")
                );
                
                // Set thông tin doctor
                appointment.setDoctor_full_name(rs.getString("doctor_name"));
                appointment.setDoctor_department(rs.getString("doctor_department"));
                
                appointments.add(appointment);
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return appointments.isEmpty() ? null : appointments;
    }

}
