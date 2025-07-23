package dao;

import dto.WaitlistDTO;
import model.Waitlist;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class WaitlistDAO {
    
    public List<Waitlist> getAllWaitlist() throws SQLException {
        List<Waitlist> waitlist = new ArrayList<>();
        DBContext db = DBContext.getInstance();
        String sql = """
            SELECT 
                w.waitlist_id,
                p.full_name AS patient_name,
                d.full_name AS doctor_name,
                r.room_name AS room,
                w.status,
                w.registered_at,
                w.estimated_time,
                w.visittype
            FROM Waitlist w
            JOIN Patient p ON w.patient_id = p.patient_id
            JOIN Doctor d ON w.doctor_id = d.doctor_id
            LEFT JOIN Room r ON w.room_id = r.room_id
            ORDER BY w.registered_at ASC
        """;
        
        try {
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                Waitlist entry = new Waitlist();
                entry.setWaitlist_id(rs.getInt("waitlist_id"));
                entry.setPatientName(rs.getString("patient_name"));
                entry.setDoctorName(rs.getString("doctor_name"));
                entry.setRoomName(rs.getString("room"));
                entry.setStatus(rs.getString("status"));
                entry.setRegistered_at(rs.getString("registered_at"));
                entry.setEstimated_time(rs.getString("estimated_time"));
                entry.setVisittype(rs.getString("visittype"));
                waitlist.add(entry);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return waitlist;
    }
    
    public boolean updateWaitlistStatus(int waitlistId, String newStatus) throws SQLException {
        DBContext db = DBContext.getInstance();
        String sql = "UPDATE Waitlist SET status = ? WHERE waitlist_id = ?";
        
        try {
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ps.setString(1, newStatus);
            ps.setInt(2, waitlistId);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

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

    public List<WaitlistDTO> getResultWaitlist() {
        List<WaitlistDTO> waitlist = new ArrayList<>();
        DBContext db = DBContext.getInstance();

        try {
            String sql = """
                SELECT w.waitlist_id, w.patient_id, w.doctor_id, w.status, w.room_id,
                       w.registered_at, w.estimated_time, w.visittype,
                       a.appointment_datetime, a.note, a.shift,
                       p.full_name, p.dob, p.gender, p.phone,
                       mr.medicineRecord_id
                FROM Appointment a
                JOIN Waitlist w ON a.patient_id = w.patient_id
                JOIN Patient p ON w.patient_id = p.patient_id
                LEFT JOIN MedicineRecords mr ON p.patient_id = mr.patient_id
                WHERE w.visittype = 'Result'
                ORDER BY w.estimated_time ASC
            """;

            PreparedStatement stmt = db.getConnection().prepareStatement(sql);
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
                dto.setMedicine_record_id(rs.getInt("medicineRecord_id"));

                waitlist.add(dto);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return waitlist;
    }

    public boolean insertWaitlist(Waitlist waitlist) {
        DBContext db = DBContext.getInstance();
        String sql = "INSERT INTO Waitlist (patient_id, doctor_id, room_id, status, visittype, registered_at, estimated_time) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try {
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ps.setInt(1, waitlist.getPatient_id());
            ps.setInt(2, waitlist.getDoctor_id());
            
            // Xử lý room_id - sử dụng null nếu là -1 (chưa phân phòng)
            if (waitlist.getRoom_id() > 0) {
                ps.setInt(3, waitlist.getRoom_id());
            } else {
                ps.setNull(3, java.sql.Types.INTEGER);
            }
            
            ps.setString(4, waitlist.getStatus());
            ps.setString(5, waitlist.getVisittype());
            
            // Sử dụng Timestamp thay vì String để tránh lỗi format
            if (waitlist.getRegistered_at() != null) {
                ps.setTimestamp(6, java.sql.Timestamp.valueOf(waitlist.getRegistered_at()));
            } else {
                ps.setTimestamp(6, new java.sql.Timestamp(System.currentTimeMillis()));
            }
            
            if (waitlist.getEstimated_time() != null) {
                ps.setTimestamp(7, java.sql.Timestamp.valueOf(waitlist.getEstimated_time()));
            } else {
                ps.setTimestamp(7, new java.sql.Timestamp(System.currentTimeMillis()));
            }
            
            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Methods for receptionist
    public List<Waitlist> getAllWaitlistForReceptionist() throws SQLException {
        List<Waitlist> waitlist = new ArrayList<>();
        DBContext db = DBContext.getInstance();
        String sql = """
            SELECT 
                w.waitlist_id,
                w.patient_id,
                w.doctor_id,
                w.room_id,
                w.status,
                w.registered_at,
                w.estimated_time,
                w.visittype,
                p.full_name AS patient_name,
                d.full_name AS doctor_name,
                r.room_name
            FROM Waitlist w
            JOIN Patient p ON w.patient_id = p.patient_id
            JOIN Doctor d ON w.doctor_id = d.doctor_id
            LEFT JOIN Room r ON w.room_id = r.room_id
            ORDER BY w.registered_at ASC
        """;
        
        try {
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                Waitlist entry = new Waitlist();
                // Set existing fields
                entry.setWaitlist_id(rs.getInt("waitlist_id"));
                entry.setPatient_id(rs.getInt("patient_id"));
                entry.setDoctor_id(rs.getInt("doctor_id"));
                entry.setRoom_id(rs.getInt("room_id"));
                entry.setStatus(rs.getString("status"));
                entry.setRegistered_at(rs.getString("registered_at"));
                entry.setEstimated_time(rs.getString("estimated_time"));
                entry.setVisittype(rs.getString("visittype"));
                
                // Set new fields for receptionist view
                entry.setPatientName(rs.getString("patient_name"));
                entry.setDoctorName(rs.getString("doctor_name"));
                entry.setRoomName(rs.getString("room_name"));
                
                waitlist.add(entry);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return waitlist;
    }
    
    public boolean updateWaitlistStatusByReceptionist(int waitlistId, String newStatus) throws SQLException {
        DBContext db = DBContext.getInstance();
        String sql = "UPDATE Waitlist SET status = ? WHERE waitlist_id = ?";
        
        try {
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ps.setString(1, newStatus);
            ps.setInt(2, waitlistId);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
