package dao;

import dto.WaitlistDTO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class WaitlistDAO {
    public List<WaitlistDTO> getDoctorWaitlist(int doctorId) {
        List<WaitlistDTO> waitlist = new ArrayList<>();
        DBContext db = DBContext.getInstance();

        try {
            String sql = """
                SELECT w.waitlist_id, w.patient_id, w.doctor_id, w.status, w.room_id,
                       w.registered_at, w.estimated_time, w.visittype,
                       a.appointment_datetime, a.note, a.shift
                FROM Appointment a
                JOIN Waitlist w ON a.patient_id = w.patient_id AND a.doctor_id = w.doctor_id
                WHERE a.doctor_id = ?
                ORDER BY w.estimated_time ASC
            """;

            PreparedStatement stmt = db.getConnection().prepareStatement(sql);
            stmt.setInt(1, doctorId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                WaitlistDTO dto = new WaitlistDTO();
                dto.setWaitlist_id(rs.getInt("waitlist_id"));
                dto.setPatient_id(rs.getInt("patient_id"));
                dto.setDoctor_id(rs.getInt("doctor_id"));
                dto.setStatus(rs.getString("status"));
                dto.setRoom_id(rs.getInt("room_id"));
                dto.setRegistered_at(rs.getString("registered_at"));
                dto.setEstimated_time(rs.getString("estimated_time"));
                dto.setVisittype(rs.getString("visittype"));
                dto.setAppointment_datetime(rs.getString("appointment_datetime"));
                dto.setNote(rs.getString("note"));
                dto.setShift(rs.getString("shift"));

                waitlist.add(dto);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return waitlist;
    }

    public WaitlistDTO getWaitlistDetailById(int waitlistId) {
        DBContext db = DBContext.getInstance();
        WaitlistDTO dto = null;

        try {
            String sql = """
            SELECT *
                        FROM Waitlist w
                        JOIN Appointment a ON w.patient_id = a.patient_id AND w.doctor_id = a.doctor_id
                        JOIN Patient p ON w.patient_id = p.patient_id
                        WHERE w.waitlist_id = ?
        """;

            PreparedStatement stmt = db.getConnection().prepareStatement(sql);
            stmt.setInt(1, waitlistId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                dto = new WaitlistDTO();
                dto.setWaitlist_id(rs.getInt("waitlist_id"));
                dto.setPatient_id(rs.getInt("patient_id"));
                dto.setDoctor_id(rs.getInt("doctor_id"));
                dto.setStatus(rs.getString("status"));
                dto.setNote(rs.getString("note"));
                dto.setRoom_id(rs.getInt("room_id"));
                dto.setRegistered_at(rs.getString("registered_at"));
                dto.setEstimated_time(rs.getString("estimated_time"));
                dto.setVisittype(rs.getString("visittype"));
                dto.setAppointment_id(rs.getInt("appointment_id"));
                dto.setAppointment_datetime(rs.getString("appointment_datetime"));
                dto.setShift(rs.getString("shift"));
                dto.setFull_name(rs.getString("full_name"));
                dto.setDob(rs.getString("dob"));
                dto.setGender(rs.getString("gender"));
                dto.setPhone(rs.getString("phone"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return dto;
    }

    public boolean updateStatus(int waitlistId, String status) {
        DBContext db = DBContext.getInstance();
        try {
            String sql = "UPDATE Waitlist SET status = ? WHERE waitlist_id = ?";
            PreparedStatement stmt = db.getConnection().prepareStatement(sql);
            stmt.setString(1, status);
            stmt.setInt(2, waitlistId);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateStatusAndVisittype(Integer waitlistId, String status, String visittype) {
        DBContext db = DBContext.getInstance();
        try {
            String sql = "UPDATE Waitlist SET status = ?, visittype = ? WHERE waitlist_id = ?";
            PreparedStatement stmt = db.getConnection().prepareStatement(sql);
            stmt.setString(1, status);
            stmt.setString(2, visittype);
            stmt.setInt(3, waitlistId);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<WaitlistDTO> getServiceOrderWaitlist(int doctorId) {
        List<WaitlistDTO> waitlist = new ArrayList<>();
        DBContext db = DBContext.getInstance();

        try {
            String sql = """
                SELECT w.waitlist_id, w.patient_id, w.doctor_id, w.status, w.room_id,
                       w.registered_at, w.estimated_time, w.visittype,
                       a.appointment_datetime, a.note, a.shift,
                       p.full_name, p.dob, p.gender, p.phone
                FROM Appointment a
                JOIN Waitlist w ON a.patient_id = w.patient_id
                JOIN Patient p ON w.patient_id = p.patient_id
                WHERE a.doctor_id = ? AND w.status = 'InProgress' AND w.visittype = 'Initial'
                ORDER BY w.estimated_time ASC
            """;

            PreparedStatement stmt = db.getConnection().prepareStatement(sql);
            stmt.setInt(1, doctorId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                WaitlistDTO dto = new WaitlistDTO();
                dto.setWaitlist_id(rs.getInt("waitlist_id"));
                dto.setPatient_id(rs.getInt("patient_id"));
                dto.setDoctor_id(rs.getInt("doctor_id"));
                dto.setStatus(rs.getString("status"));
                dto.setRoom_id(rs.getInt("room_id"));
                dto.setRegistered_at(rs.getString("registered_at"));
                dto.setEstimated_time(rs.getString("estimated_time"));
                dto.setVisittype(rs.getString("visittype"));
                dto.setAppointment_datetime(rs.getString("appointment_datetime"));
                dto.setNote(rs.getString("note"));
                dto.setShift(rs.getString("shift"));
                dto.setFull_name(rs.getString("full_name"));
                dto.setDob(rs.getString("dob"));
                dto.setGender(rs.getString("gender"));
                dto.setPhone(rs.getString("phone"));

                waitlist.add(dto);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return waitlist;
    }

}
