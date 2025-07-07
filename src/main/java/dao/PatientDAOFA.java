package dao;

import dto.PatientDTOFA;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PatientDAOFA {
    private final DBContext db = DBContext.getInstance();

    public List<PatientDTOFA> getPatientsByAccountIdFiltered(String accountPatientId, String gender, String search) throws SQLException {
        List<PatientDTOFA> result = new ArrayList<>();

        StringBuilder sql = new StringBuilder("""
        SELECT a.patient_id, a.full_name, a.dob, a.gender, a.phone, a.address, b.account_patient_id
        FROM Patient a
        JOIN Patient_AccountPatient b ON a.patient_id = b.patient_id
        WHERE b.account_patient_id = ?
    """);

        List<Object> params = new ArrayList<>();
        params.add(accountPatientId);

        if (gender != null && !gender.isBlank()) {
            sql.append(" AND a.gender = ?");
            params.add(gender);
        }

        if (search != null && !search.isBlank()) {
            sql.append("""
            AND (
                a.full_name COLLATE Latin1_General_CI_AI LIKE ? OR
                a.phone COLLATE Latin1_General_CI_AI LIKE ? OR
                a.address COLLATE Latin1_General_CI_AI LIKE ?
            )
        """);
            String keyword = "%" + search.trim().replaceAll("\\s+", " ") + "%";
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }

        sql.append(" ORDER BY a.patient_id DESC");

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PatientDTOFA p = new PatientDTOFA();
                    p.setPatientId(rs.getInt("patient_id"));
                    p.setFullName(rs.getString("full_name"));
                    p.setDob(rs.getDate("dob").toString());
                    p.setGender(rs.getString("gender"));
                    p.setPhone(rs.getString("phone"));
                    p.setAddress(rs.getString("address"));
                    p.setAccountPatientId(rs.getInt("account_patient_id"));
                    result.add(p);
                }
            }
        }

        return result;
    }

    public boolean updatePatient(int patientId, String fullName, String dob, String gender, String phone, String address) throws SQLException {
        String sql = """
        UPDATE Patient
        SET full_name = ?, dob = ?, gender = ?, phone = ?, address = ?
        WHERE patient_id = ?
    """;

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, fullName);
            ps.setDate(2, Date.valueOf(dob)); // Ensure dob is in format yyyy-MM-dd
            ps.setString(3, gender);
            ps.setString(4, phone);
            ps.setString(5, address);
            ps.setInt(6, patientId);

            int rows = ps.executeUpdate();
            return rows > 0;
        }
    }

    public boolean createPatient(String fullName, String dob, String gender, String phone, String address, int accountPatientId) {
        String insertPatientSql = "INSERT INTO Patient(full_name, dob, gender, phone, address) VALUES (?, ?, ?, ?, ?)";
        String linkSql = "INSERT INTO Patient_AccountPatient(patient_id, account_patient_id) VALUES (?, ?)";

        Connection conn = null;
        PreparedStatement psPatient = null;
        PreparedStatement psLink = null;
        ResultSet rs = null;

        try {
            conn = DBContext.getInstance().getConnection();
            conn.setAutoCommit(false); // transaction begin

            // Insert patient
            psPatient = conn.prepareStatement(insertPatientSql, Statement.RETURN_GENERATED_KEYS);
            psPatient.setNString(1, fullName);
            psPatient.setNString(2, dob);
            psPatient.setNString(3, gender);
            psPatient.setString(4, phone);
            psPatient.setString(5, address);
            int rowsAffected = psPatient.executeUpdate();

            if (rowsAffected == 0) {
                conn.rollback();
                return false;
            }

            // Get generated patient_id
            rs = psPatient.getGeneratedKeys();
            int patientId = -1;
            if (rs.next()) {
                patientId = rs.getInt(1);
            } else {
                conn.rollback();
                return false;
            }

            // Insert linking to account
            psLink = conn.prepareStatement(linkSql);
            psLink.setInt(1, patientId);
            psLink.setInt(2, accountPatientId);
            psLink.executeUpdate();

            conn.commit();
            return true;

        } catch (SQLException e) {
            e.printStackTrace();
            try {
                if (conn != null) conn.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
            return false;
        } finally {
            try {
                if (rs != null) rs.close();
                if (psPatient != null) psPatient.close();
                if (psLink != null) psLink.close();
                if (conn != null) conn.setAutoCommit(true); // reset auto-commit
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public List<PatientDTOFA> getPatientsNotLinkedToAccount(int accountPatientId) {
        List<PatientDTOFA> list = new ArrayList<>();
        String sql = """
        SELECT p.patient_id, p.full_name, p.dob, p.gender, p.phone, p.address
        FROM Patient p
        WHERE p.patient_id NOT IN (
            SELECT b.patient_id
            FROM Patient_AccountPatient b
            WHERE b.account_patient_id = ?
        )
        """;

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, accountPatientId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PatientDTOFA p = new PatientDTOFA();
                    p.setPatientId(rs.getInt("patient_id"));
                    p.setFullName(rs.getString("full_name"));
                    p.setDob(rs.getString("dob"));
                    p.setGender(rs.getString("gender"));
                    p.setPhone(rs.getString("phone"));
                    p.setAddress(rs.getString("address"));
                    list.add(p);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }

    public boolean linkPatientsToAccount(int accountId, List<Integer> patientIds) {
        String sql = "INSERT INTO Patient_AccountPatient(patient_id, account_patient_id) VALUES (?, ?)";

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (Integer pid : patientIds) {
                ps.setInt(1, pid);
                ps.setInt(2, accountId);
                ps.addBatch();
            }

            ps.executeBatch();
            return true;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean unlinkPatientFromAccount(int patientId, int accountPatientId) {
        String sql = "DELETE FROM Patient_AccountPatient WHERE patient_id = ? AND account_patient_id = ?";

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, patientId);
            ps.setInt(2, accountPatientId);

            int affected = ps.executeUpdate();
            return affected > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

}
