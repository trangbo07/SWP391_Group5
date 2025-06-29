package dao;

import dto.DoctorDTOFA;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class AdminSystemDAO {

    //For Doctor
    public List<DoctorDTOFA> getAllDoctors() {
        List<DoctorDTOFA> list = new ArrayList<>();
        String sql = """
                    SELECT a.account_staff_id, a.username, a.role, a.email, a.img, a.status,
                                       b.doctor_id, b.full_name, b.department, b.phone, b.eduLevel
                                FROM AccountStaff a
                                JOIN Doctor b ON a.account_staff_id = b.account_staff_id
                    ORDER BY a.account_staff_id DESC
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                DoctorDTOFA dto = new DoctorDTOFA(
                        rs.getInt("account_staff_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("role"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status"),
                        rs.getInt("doctor_id"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone"),
                        rs.getString("eduLevel")
                );
                list.add(dto);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public DoctorDTOFA getDoctorById(int doctorId) {
        String sql = """
                    SELECT a.account_staff_id, a.username, a.role, a.email, a.img, a.status,
                           b.doctor_id, b.full_name, b.department, b.phone, b.eduLevel
                    FROM AccountStaff a
                    JOIN Doctor b ON a.account_staff_id = b.account_staff_id
                    WHERE b.doctor_id = ?
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, doctorId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new DoctorDTOFA(
                            rs.getInt("account_staff_id"),
                            rs.getString("username"),
                            rs.getString("role"),
                            rs.getString("email"),
                            rs.getString("img"),
                            rs.getString("status"),
                            rs.getInt("doctor_id"),
                            rs.getString("full_name"),
                            rs.getString("department"),
                            rs.getString("phone"),
                            rs.getString("eduLevel")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<String> getDistinctValues(String fieldName) {
        List<String> result = new ArrayList<>();
        // Kiểm tra để tránh SQL injection từ đầu vào không hợp lệ
        List<String> allowedFields = List.of("status", "eduLevel", "department");

        if (!allowedFields.contains(fieldName)) {
            throw new IllegalArgumentException("Invalid field name: " + fieldName);
        }

        String sql = "SELECT DISTINCT " + fieldName +
                " FROM AccountStaff a JOIN Doctor b ON a.account_staff_id = b.account_staff_id";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                result.add(rs.getString(1));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }

    public List<DoctorDTOFA> filterDoctors(String status, String eduLevel, String department, String search) {
        List<DoctorDTOFA> result = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
                    SELECT a.account_staff_id, a.username, a.password, a.email, a.img, a.role, a.status,
                           b.doctor_id, b.full_name, b.phone, b.department, b.eduLevel
                    FROM AccountStaff a JOIN Doctor b ON a.account_staff_id = b.account_staff_id
                    WHERE 1 = 1
                """);

        List<Object> params = new ArrayList<>();

        if (status != null && !status.isEmpty()) {
            sql.append(" AND a.status = ?");
            params.add(status);
        }

        if (eduLevel != null && !eduLevel.isEmpty()) {
            sql.append(" AND b.eduLevel = ?");
            params.add(eduLevel);
        }

        if (department != null && !department.isEmpty()) {
            sql.append(" AND b.department = ?");
            params.add(department);
        }

        if (search != null && !search.isEmpty()) {
            sql.append("""
                     AND (
                         b.full_name COLLATE Latin1_General_CI_AI LIKE ? OR
                         a.username COLLATE Latin1_General_CI_AI LIKE ? OR
                         a.email COLLATE Latin1_General_CI_AI LIKE ?
                     )
                    """);

            String keyword = "%" + search.replaceAll("\\s+", " ") + "%";
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }
        sql.append(" ORDER BY a.account_staff_id DESC");

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                DoctorDTOFA doctor = new DoctorDTOFA(
                        rs.getInt("account_staff_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("role"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status"),
                        rs.getInt("doctor_id"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone"),
                        rs.getString("eduLevel")
                );
                result.add(doctor);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }

    public boolean insertDoctor(String username, String password, String email, String img, String status,
                                String fullName, String phone, String department, String eduLevel) {
        String insertAccountSql = """
                    INSERT INTO AccountStaff (username, password, email, img, role, status)
                    VALUES (?, ?, ?, ?, 'Doctor', ?)
                """;

        String insertDoctorSql = """
                    INSERT INTO Doctor (account_staff_id, full_name, phone, department, eduLevel)
                    VALUES (?, ?, ?, ?, ?)
                """;

        Connection conn = null;
        PreparedStatement psAccount = null;
        PreparedStatement psDoctor = null;
        ResultSet generatedKeys = null;

        try {
            conn = DBContext.getInstance().getConnection();
            conn.setAutoCommit(false); // Bắt đầu transaction

            // Insert account
            psAccount = conn.prepareStatement(insertAccountSql, PreparedStatement.RETURN_GENERATED_KEYS);
            psAccount.setString(1, username);
            psAccount.setString(2, password);
            psAccount.setString(3, email);
            psAccount.setString(4, img);
            psAccount.setString(5, status);

            int affectedRows = psAccount.executeUpdate();
            if (affectedRows == 0) {
                conn.rollback();
                return false;
            }

            generatedKeys = psAccount.getGeneratedKeys();
            if (generatedKeys.next()) {
                int accountStaffId = generatedKeys.getInt(1);

                // Insert doctor
                psDoctor = conn.prepareStatement(insertDoctorSql);
                psDoctor.setInt(1, accountStaffId);
                psDoctor.setString(2, fullName);
                psDoctor.setString(3, phone);
                psDoctor.setString(4, department);
                psDoctor.setString(5, eduLevel);

                int insertedDoctor = psDoctor.executeUpdate();
                if (insertedDoctor > 0) {
                    conn.commit();
                    return true;
                } else {
                    conn.rollback();
                    return false;
                }
            } else {
                conn.rollback();
                return false;
            }

        } catch (Exception e) {
            e.printStackTrace();
            try {
                if (conn != null) conn.rollback();
            } catch (Exception rollbackEx) {
                rollbackEx.printStackTrace();
            }
            return false;

        } finally {
            try {
                if (generatedKeys != null) generatedKeys.close();
            } catch (Exception ignored) {
            }
            try {
                if (psDoctor != null) psDoctor.close();
            } catch (Exception ignored) {
            }
            try {
                if (psAccount != null) psAccount.close();
            } catch (Exception ignored) {
            }
            try {
                if (conn != null) conn.setAutoCommit(true);
                conn.close();
            } catch (Exception ignored) {
            }
        }
    }

    public boolean isEmailOrUsernameDuplicated(String newUsername, String newEmail, String oldUsername, String oldEmail) {
        String sql = """
                    SELECT TOP 1 1
                    FROM (
                        SELECT email, username FROM AccountStaff
                        UNION
                        SELECT email, username FROM AccountPharmacist
                        UNION
                        SELECT email, username FROM AccountPatient
                    ) AS combined
                    WHERE (email = ? AND email != ?)
                       OR (username = ? AND username != ?)
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, newEmail);
            ps.setString(2, oldEmail);
            ps.setString(3, newUsername);
            ps.setString(4, oldUsername);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    public boolean updateDoctor(int doctorId, int accountStaffId, String username, String email, String imagePath,
                                String status, String fullName, String phone, String department, String eduLevel) {
        String updateAccountSql = """
                    UPDATE AccountStaff
                    SET username = ?, email = ?, img = ?, status = ?
                    WHERE account_staff_id = ? AND role = 'Doctor'
                """;

        String updateDoctorSql = """
                    UPDATE Doctor
                    SET full_name = ?, phone = ?, department = ?, eduLevel = ?
                    WHERE doctor_id = ? AND account_staff_id = ?
                """;

        Connection conn = null;
        PreparedStatement psAccount = null;
        PreparedStatement psDoctor = null;

        try {
            conn = DBContext.getInstance().getConnection();
            conn.setAutoCommit(false);

            psAccount = conn.prepareStatement(updateAccountSql);
            psAccount.setString(1, username);
            psAccount.setString(2, email);
            psAccount.setString(3, imagePath);
            psAccount.setString(4, status);
            psAccount.setInt(5, accountStaffId);

            int accountAffected = psAccount.executeUpdate();
            if (accountAffected == 0) {
                conn.rollback();
                return false;
            }

            psDoctor = conn.prepareStatement(updateDoctorSql);
            psDoctor.setString(1, fullName);
            psDoctor.setString(2, phone);
            psDoctor.setString(3, department);
            psDoctor.setString(4, eduLevel);
            psDoctor.setInt(5, doctorId);
            psDoctor.setInt(6, accountStaffId);

            int doctorAffected = psDoctor.executeUpdate();
            if (doctorAffected == 0) {
                conn.rollback();
                return false;
            }

            conn.commit();
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            try {
                if (conn != null) conn.rollback();
            } catch (Exception rollbackEx) {
                rollbackEx.printStackTrace();
            }
            return false;

        } finally {
            try {
                if (psDoctor != null) psDoctor.close();
            } catch (Exception ignored) {
            }
            try {
                if (psAccount != null) psAccount.close();
            } catch (Exception ignored) {
            }
            try {
                if (conn != null) conn.setAutoCommit(true);
                conn.close();
            } catch (Exception ignored) {
            }
        }
    }

    public boolean updateAccountStaffStatus(int doctorId, String newStatus) {
        String sql = """
        UPDATE AccountStaff
        SET status = ?
        WHERE account_staff_id = (
            SELECT account_staff_id FROM Doctor WHERE doctor_id = ?
        )
    """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, newStatus);
            ps.setInt(2, doctorId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }



    //For ...
}