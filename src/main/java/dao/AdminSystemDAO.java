package dao;

import dto.AdminDTOFA;
import dto.DoctorDTOFA;
import dto.PharmacistDTOFA;
import dto.ReceptionistDTOFA;
import model.AccountPharmacist;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
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

    public boolean updateAccountStaffStatus(int account_staff_id, String newStatus) {
        String sql = """
                    UPDATE AccountStaff
                    SET status = ?
                    WHERE account_staff_id = ?
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, newStatus);
            ps.setInt(2, account_staff_id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    //For Receptionist
    public List<ReceptionistDTOFA> getAllReceptionists() {
        List<ReceptionistDTOFA> list = new ArrayList<>();
        String sql = """
                    SELECT a.account_staff_id, a.username, a.password ,a.role ,a.email, a.img, a.status,
                                        b.receptionist_id, b.full_name, b.phone
                                        FROM AccountStaff a
                                        JOIN Receptionist b ON a.account_staff_id = b.account_staff_id
                                        ORDER BY a.account_staff_id DESC
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                ReceptionistDTOFA dto = new ReceptionistDTOFA(
                        rs.getInt("account_staff_id"),
                        rs.getString("username"),
                        rs.getString("role"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status"),
                        rs.getInt("receptionist_id"),
                        rs.getString("full_name"),
                        rs.getString("phone"),
                        rs.getString("password")
                );

                list.add(dto);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public ReceptionistDTOFA getReceptionistById(int receptionistId) {
        String sql = """
                    SELECT a.account_staff_id, a.username, a.password, a.role, a.email, a.img, a.status,
                           b.receptionist_id, b.full_name, b.phone
                    FROM AccountStaff a
                    JOIN Receptionist b ON a.account_staff_id = b.account_staff_id
                    WHERE b.receptionist_id = ?
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, receptionistId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new ReceptionistDTOFA(
                            rs.getInt("account_staff_id"),
                            rs.getString("username"),
                            rs.getString("role"),
                            rs.getString("email"),
                            rs.getString("img"),
                            rs.getString("status"),
                            rs.getInt("receptionist_id"),
                            rs.getString("full_name"),
                            rs.getString("phone"),
                            rs.getString("password")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<String> getDistinctValuesRecep(String fieldName) {
        List<String> result = new ArrayList<>();
        // Kiểm tra để tránh SQL injection từ đầu vào không hợp lệ
        List<String> allowedFields = List.of("status", "eduLevel", "department");

        if (!allowedFields.contains(fieldName)) {
            throw new IllegalArgumentException("Invalid field name: " + fieldName);
        }

        String sql = "SELECT DISTINCT " + fieldName +
                " FROM AccountStaff a JOIN Receptionist b ON a.account_staff_id = b.account_staff_id";

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

    public List<ReceptionistDTOFA> filterReceptionists(String status, String search) {
        List<ReceptionistDTOFA> result = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
                    SELECT a.account_staff_id, a.username, a.password, a.role, a.email, a.img, a.status,
                           b.receptionist_id, b.full_name, b.phone
                    FROM AccountStaff a
                    JOIN Receptionist b ON a.account_staff_id = b.account_staff_id
                    WHERE 1 = 1
                """);

        List<Object> params = new ArrayList<>();

        if (status != null && !status.isEmpty()) {
            sql.append(" AND a.status = ?");
            params.add(status);
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
                ReceptionistDTOFA receptionist = new ReceptionistDTOFA(
                        rs.getInt("account_staff_id"),
                        rs.getString("username"),
                        rs.getString("role"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status"),
                        rs.getInt("receptionist_id"),
                        rs.getString("full_name"),
                        rs.getString("phone"),
                        rs.getString("password")
                );
                result.add(receptionist);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }

    public boolean insertReceptionist(String username, String password, String email, String img, String status,
                                      String fullName, String phone) {
        String insertAccountSql = """
                    INSERT INTO AccountStaff (username, password, email, img, role, status)
                    VALUES (?, ?, ?, ?, 'Receptionist', ?)
                """;

        String insertReceptionistSql = """
                    INSERT INTO Receptionist (account_staff_id, full_name, phone)
                    VALUES (?, ?, ?)
                """;

        Connection conn = null;
        PreparedStatement psAccount = null;
        PreparedStatement psReceptionist = null;
        ResultSet generatedKeys = null;

        try {
            conn = DBContext.getInstance().getConnection();
            conn.setAutoCommit(false);

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

                psReceptionist = conn.prepareStatement(insertReceptionistSql);
                psReceptionist.setInt(1, accountStaffId);
                psReceptionist.setString(2, fullName);
                psReceptionist.setString(3, phone);

                int inserted = psReceptionist.executeUpdate();
                if (inserted > 0) {
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
            } catch (Exception ignored) {
            }
            return false;
        } finally {
            try {
                if (generatedKeys != null) generatedKeys.close();
                if (psReceptionist != null) psReceptionist.close();
                if (psAccount != null) psAccount.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (Exception ignored) {
            }
        }
    }

    public boolean updateReceptionist(int receptionistId, int accountStaffId,
                                      String username, String email, String imagePath,
                                      String status, String fullName, String phone) {

        String updateAccountSql = """
                    UPDATE AccountStaff
                    SET username = ?, email = ?, img = ?, status = ?
                    WHERE account_staff_id = ? AND role = 'Receptionist'
                """;

        String updateReceptionistSql = """
                    UPDATE Receptionist
                    SET full_name = ?, phone = ?
                    WHERE receptionist_id = ? AND account_staff_id = ?
                """;

        Connection conn = null;
        PreparedStatement psAccount = null;
        PreparedStatement psReceptionist = null;

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

            psReceptionist = conn.prepareStatement(updateReceptionistSql);
            psReceptionist.setString(1, fullName);
            psReceptionist.setString(2, phone);
            psReceptionist.setInt(3, receptionistId);
            psReceptionist.setInt(4, accountStaffId);

            int receptionistAffected = psReceptionist.executeUpdate();
            if (receptionistAffected == 0) {
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
                if (psReceptionist != null) psReceptionist.close();
            } catch (Exception ignored) {
            }
            try {
                if (psAccount != null) psAccount.close();
            } catch (Exception ignored) {
            }
            try {
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (Exception ignored) {
            }
        }
    }

    //For Admin
    public List<AdminDTOFA> getAllAdmins() {
        List<AdminDTOFA> list = new ArrayList<>();
        String sql = """
                    SELECT a.account_staff_id, a.username, a.password, a.role, a.email, a.img, a.status,
                           b.admin_id, b.full_name, b.phone, b.department
                    FROM AccountStaff a
                    JOIN Admin b ON a.account_staff_id = b.account_staff_id
                    ORDER BY a.account_staff_id DESC
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                AdminDTOFA dto = new AdminDTOFA(
                        rs.getInt("account_staff_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("role"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status"),
                        rs.getInt("admin_id"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone")
                );
                list.add(dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public AdminDTOFA getAdminById(int adminId) {
        String sql = """
                    SELECT a.account_staff_id, a.username, a.password, a.role, a.email, a.img, a.status,
                           b.admin_id, b.full_name, b.phone, b.department
                    FROM AccountStaff a
                    JOIN Admin b ON a.account_staff_id = b.account_staff_id
                    WHERE b.admin_id = ?
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, adminId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new AdminDTOFA(
                            rs.getInt("account_staff_id"),
                            rs.getString("username"),
                            rs.getString("password"),
                            rs.getString("role"),
                            rs.getString("email"),
                            rs.getString("img"),
                            rs.getString("status"),
                            rs.getInt("admin_id"),
                            rs.getString("full_name"),
                            rs.getString("department"),
                            rs.getString("phone")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<AdminDTOFA> filterAdmins(String status, String role, String department, String search) {
        List<AdminDTOFA> result = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
                    SELECT a.account_staff_id, a.username, a.password, a.role, a.email, a.img, a.status,
                           b.admin_id, b.full_name, b.phone, b.department
                    FROM AccountStaff a
                    JOIN Admin b ON a.account_staff_id = b.account_staff_id
                    WHERE 1 = 1
                """);

        List<Object> params = new ArrayList<>();
        if (status != null && !status.isEmpty()) {
            sql.append(" AND a.status = ?");
            params.add(status);
        }
        if (role != null && !role.isEmpty()) {
            sql.append(" AND a.role = ?");
            params.add(role);
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
            String keyword = "%" + search.trim().replaceAll("\\s+", " ") + "%";
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

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    AdminDTOFA admin = new AdminDTOFA(
                            rs.getInt("account_staff_id"),
                            rs.getString("username"),
                            rs.getString("password"),
                            rs.getString("role"),
                            rs.getString("email"),
                            rs.getString("img"),
                            rs.getString("status"),
                            rs.getInt("admin_id"),
                            rs.getString("full_name"),
                            rs.getString("department"),
                            rs.getString("phone")
                    );
                    result.add(admin);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    public List<String> getDistinctValuesAdmin(String fieldName) {
        List<String> result = new ArrayList<>();
        List<String> allowedFields = List.of("status", "department", "role");

        if (!allowedFields.contains(fieldName)) {
            throw new IllegalArgumentException("Invalid field name: " + fieldName);
        }

        String sql = """
                    SELECT DISTINCT %s FROM AccountStaff a
                    JOIN Admin b ON a.account_staff_id = b.account_staff_id
                    WHERE %s IS NOT NULL
                """.formatted(fieldName, fieldName);

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

    public boolean insertAdmin(String username, String password, String email, String img, String status,
                               String fullName, String phone, String department, String role) {
        String insertAccountSql = """
                    INSERT INTO AccountStaff (username, password, email, img, role, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                """;

        String insertAdminSql = """
                    INSERT INTO Admin (account_staff_id, full_name, phone, department)
                    VALUES (?, ?, ?, ?)
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement psAccount = conn.prepareStatement(insertAccountSql, Statement.RETURN_GENERATED_KEYS)) {

            conn.setAutoCommit(false);

            psAccount.setString(1, username);
            psAccount.setString(2, password);
            psAccount.setString(3, email);
            psAccount.setString(4, img);
            psAccount.setString(5, role);
            psAccount.setString(6, status);

            int affectedRows = psAccount.executeUpdate();
            if (affectedRows == 0) {
                conn.rollback();
                return false;
            }

            try (ResultSet generatedKeys = psAccount.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int accountStaffId = generatedKeys.getInt(1);

                    try (PreparedStatement psAdmin = conn.prepareStatement(insertAdminSql)) {
                        psAdmin.setInt(1, accountStaffId);
                        psAdmin.setString(2, fullName);
                        psAdmin.setString(3, phone);
                        psAdmin.setString(4, department);

                        if (psAdmin.executeUpdate() == 0) {
                            conn.rollback();
                            return false;
                        }
                    }
                } else {
                    conn.rollback();
                    return false;
                }
            }
            conn.commit();
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateAdmin(int adminId, int accountStaffId,
                               String username, String email, String imagePath, String status, String role,
                               String fullName, String phone, String department) {

        String updateAccountSql = """
                    UPDATE AccountStaff
                    SET username = ?, email = ?, img = ?, status = ?, role = ?
                    WHERE account_staff_id = ?
                """;

        String updateAdminSql = """
                    UPDATE Admin
                    SET full_name = ?, phone = ?, department = ?
                    WHERE admin_id = ? AND account_staff_id = ?
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement psAcc = conn.prepareStatement(updateAccountSql);
             PreparedStatement psAdmin = conn.prepareStatement(updateAdminSql)) {

            conn.setAutoCommit(false);

            psAcc.setString(1, username);
            psAcc.setString(2, email);
            psAcc.setString(3, imagePath);
            psAcc.setString(4, status);
            psAcc.setString(5, role);
            psAcc.setInt(6, accountStaffId);
            if (psAcc.executeUpdate() == 0) {
                conn.rollback();
                return false;
            }

            psAdmin.setString(1, fullName);
            psAdmin.setString(2, phone);
            psAdmin.setString(3, department);
            psAdmin.setInt(4, adminId);
            psAdmin.setInt(5, accountStaffId);
            if (psAdmin.executeUpdate() == 0) {
                conn.rollback();
                return false;
            }

            conn.commit();
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    //For Pharmacist
    public List<PharmacistDTOFA> getAllPharmacists() {
        List<PharmacistDTOFA> list = new ArrayList<>();
        String sql = """
                    SELECT a.account_pharmacist_id, a.username, a.password, a.email, a.img, a.status,
                           b.pharmacist_id, b.full_name, b.phone, b.eduLevel
                    FROM AccountPharmacist a
                    JOIN Pharmacist b ON a.account_pharmacist_id = b.account_pharmacist_id
                    ORDER BY a.account_pharmacist_id DESC
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                PharmacistDTOFA dto = new PharmacistDTOFA(
                        rs.getInt("account_pharmacist_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("status"),
                        rs.getString("img"),
                        rs.getInt("pharmacist_id"),
                        rs.getString("full_name"),
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

    public PharmacistDTOFA getPharmacistById(int pharmacistId) {
        String sql = """
                    SELECT a.account_pharmacist_id, a.username, a.password, a.email, a.img, a.status,
                           b.pharmacist_id, b.full_name, b.phone, b.eduLevel
                    FROM AccountPharmacist a
                    JOIN Pharmacist b ON a.account_pharmacist_id = b.account_pharmacist_id
                    WHERE b.pharmacist_id = ?
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, pharmacistId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new PharmacistDTOFA(
                            rs.getInt("account_pharmacist_id"),
                            rs.getString("username"),
                            rs.getString("password"),
                            rs.getString("email"),
                            rs.getString("status"),
                            rs.getString("img"),
                            rs.getInt("pharmacist_id"),
                            rs.getString("full_name"),
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

    public List<String> getDistinctValuesPharmacist(String fieldName) {
        List<String> result = new ArrayList<>();
        List<String> allowedFields = List.of("status", "eduLevel");

        if (!allowedFields.contains(fieldName)) {
            throw new IllegalArgumentException("Invalid field name: " + fieldName);
        }

        String sql = """
                SELECT DISTINCT %s FROM AccountPharmacist a
                JOIN Pharmacist b ON a.account_pharmacist_id = b.account_pharmacist_id
                WHERE %s IS NOT NULL
            """.formatted(fieldName, fieldName);

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

    public List<PharmacistDTOFA> filterPharmacists(String status, String eduLevel, String search) {
        List<PharmacistDTOFA> result = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
                SELECT a.account_pharmacist_id, a.username, a.password, a.email, a.img, a.status,
                       b.pharmacist_id, b.full_name, b.phone, b.eduLevel
                FROM AccountPharmacist a
                JOIN Pharmacist b ON a.account_pharmacist_id = b.account_pharmacist_id
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
        if (search != null && !search.isEmpty()) {
            sql.append("""
                    AND (
                        b.full_name COLLATE Latin1_General_CI_AI LIKE ? OR
                        a.username COLLATE Latin1_General_CI_AI LIKE ? OR
                        a.email COLLATE Latin1_General_CI_AI LIKE ?
                    )
                """);
            String keyword = "%" + search.trim().replaceAll("\\s+", " ") + "%";
            params.add(keyword);
            params.add(keyword);
            params.add(keyword);
        }

        sql.append(" ORDER BY a.account_pharmacist_id DESC");

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PharmacistDTOFA pharmacist = new PharmacistDTOFA(
                            rs.getInt("account_pharmacist_id"),
                            rs.getString("username"),
                            rs.getString("password"),
                            rs.getString("email"),
                            rs.getString("status"),
                            rs.getString("img"),
                            rs.getInt("pharmacist_id"),
                            rs.getString("full_name"),
                            rs.getString("phone"),
                            rs.getString("eduLevel")
                    );
                    result.add(pharmacist);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }

    public boolean insertPharmacist(String username, String password, String email, String img, String status,
                                    String fullName, String phone, String eduLevel) {
        String insertAccountSql = """
        INSERT INTO AccountPharmacist (username, password, email, img, status)
        VALUES (?, ?, ?, ?, ?)
    """;

        String insertPharmacistSql = """
        INSERT INTO Pharmacist (account_pharmacist_id, full_name, phone, eduLevel)
        VALUES (?, ?, ?, ?)
    """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement psAccount = conn.prepareStatement(insertAccountSql, Statement.RETURN_GENERATED_KEYS)) {

            conn.setAutoCommit(false); // Bắt đầu transaction

            // B1. Insert vào AccountPharmacist
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

            int accountPharmacistId;
            try (ResultSet rs = psAccount.getGeneratedKeys()) {
                if (rs.next()) {
                    accountPharmacistId = rs.getInt(1);
                } else {
                    conn.rollback();
                    return false;
                }
            }

            // B2. Insert vào Pharmacist
            try (PreparedStatement psPharmacist = conn.prepareStatement(insertPharmacistSql)) {
                psPharmacist.setInt(1, accountPharmacistId);
                psPharmacist.setString(2, fullName);
                psPharmacist.setString(3, phone);
                psPharmacist.setString(4, eduLevel);

                if (psPharmacist.executeUpdate() == 0) {
                    conn.rollback();
                    return false;
                }
            }

            conn.commit(); // Thành công
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    public boolean updatePharmacist(int pharmacistId, int accountPharmacistId, String username, String email, String imagePath,
                                    String status, String fullName, String phone, String eduLevel) {
        String updateAccountSql = """
                    UPDATE AccountPharmacist
                    SET username = ?, email = ?, img = ?, status = ?
                    WHERE account_pharmacist_id = ?
                """;

        String updatePharmacistSql = """
                    UPDATE Pharmacist
                    SET full_name = ?, phone = ?, eduLevel = ?
                    WHERE pharmacist_id = ? AND account_pharmacist_id = ?
                """;

        try (Connection conn = DBContext.getInstance().getConnection()) {
            conn.setAutoCommit(false);

            try (PreparedStatement psAccount = conn.prepareStatement(updateAccountSql);
                 PreparedStatement psPharmacist = conn.prepareStatement(updatePharmacistSql)) {

                psAccount.setString(1, username);
                psAccount.setString(2, email);
                psAccount.setString(3, imagePath);
                psAccount.setString(4, status);
                psAccount.setInt(5, accountPharmacistId);
                int accUpdated = psAccount.executeUpdate();

                psPharmacist.setString(1, fullName);
                psPharmacist.setString(2, phone);
                psPharmacist.setString(3, eduLevel);
                psPharmacist.setInt(4, pharmacistId);
                psPharmacist.setInt(5, accountPharmacistId);
                int pharmUpdated = psPharmacist.executeUpdate();

                if (accUpdated > 0 && pharmUpdated > 0) {
                    conn.commit();
                    return true;
                } else {
                    conn.rollback();
                }
            } catch (Exception e) {
                conn.rollback();
                e.printStackTrace();
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateAccountPharmacistStatus(int accountPharmacistId, String newStatus) {
        String sql = """
                UPDATE AccountPharmacist
                SET status = ?
                WHERE account_pharmacist_id = ?
            """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, newStatus);
            ps.setInt(2, accountPharmacistId);

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    public AccountPharmacist getAccountPharmacistById(int id) {
        String sql = """
            SELECT account_pharmacist_id, username, password, email, img, status
            FROM AccountPharmacist
            WHERE account_pharmacist_id = ?
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new AccountPharmacist(
                            rs.getInt("account_pharmacist_id"),
                            rs.getString("username"),
                            rs.getString("password"),
                            rs.getString("email"),
                            rs.getString("img"),
                            rs.getString("status")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

}

