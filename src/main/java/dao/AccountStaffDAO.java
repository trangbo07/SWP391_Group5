package dao;

import model.*;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;

public class AccountStaffDAO {
    public static AccountStaff checkLogin(String username, String password) {
        DBContext db = DBContext.getInstance();
        AccountStaff staff = null;

        try {
            String sql = """    
                    SELECT * FROM AccountStaff WHERE (username = ? OR email = ?) AND password = ? AND status = 'Enable'
                    """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, username);
            statement.setString(2, username);
            statement.setString(3, password);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                staff = new AccountStaff(
                        rs.getInt("account_staff_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("role"),
                        rs.getString("img"),
                        rs.getString("status")
                );
            }
        } catch (Exception e) {
            return null;
        }

        return staff;
    }

    public boolean checkAccountStaff(String uoe) {
        DBContext db = DBContext.getInstance();

        try {
            String sql = """
                    SELECT * FROM AccountStaff 
                    WHERE username = ? OR email = ?
                    """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, uoe);
            statement.setString(2, uoe);

            ResultSet rs = statement.executeQuery();
            boolean exists = rs.next(); // true nếu có dòng dữ liệu trả về

            rs.close();
            statement.close();
            return exists;
        } catch (Exception e) {
            e.printStackTrace(); // Ghi log lỗi
            return false; // Có lỗi xảy ra thì coi như đăng nhập thất bại
        }
    }

    public AccountStaff getAccountStaffById(int id) {
        String sql = "SELECT * FROM AccountStaff WHERE account_staff_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new AccountStaff(
                            rs.getInt("account_staff_id"),
                            rs.getString("username"),
                            rs.getString("password"),
                            rs.getString("email"),
                            rs.getString("role"),
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

    public boolean updatePassword(String email, String newPassword) {
        DBContext db = DBContext.getInstance();

        try {
            String sql = "UPDATE AccountStaff SET password = ? WHERE email = ?";
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ps.setString(1, newPassword); // Should be hashed
            ps.setString(2, email);
            int rowsAffected = ps.executeUpdate();
            ps.close();
            return rowsAffected > 0;
        } catch (Exception e) {
            System.err.println("Error updating password: " + e.getClass().getName() + " - " + e.getMessage());
            return false;
        }
    }

    public AccountStaff getAccountByEmailOrUsername(String emailOrUsername) {
        DBContext db = DBContext.getInstance();
        AccountStaff staff = null;

        try {
            String sql = """
                    SELECT * FROM AccountStaff 
                    WHERE username = ? OR email = ?
                    """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, emailOrUsername);
            statement.setString(2, emailOrUsername);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                staff = new AccountStaff(
                        rs.getInt("account_staff_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("role"),
                        rs.getString("img"),
                        rs.getString("status")
                );
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return staff;
    }

    public Object getOStaffByStaffId(int account_staff_id, String role) {
        DBContext db = DBContext.getInstance();
        Object staffObject = null;

        String roleTable = switch (role) {
            case "Doctor" -> "Doctor";
            case "Nurse" -> "Nurse";
            case "Receptionist" -> "Receptionist";
            case "AdminSystem", "AdminBusiness" -> "Admin"; // gộp bảng Admin
            default -> null;
        };

        if (roleTable == null) return null;

        try {
            String sql;
            if (role.equals("AdminSystem") || role.equals("AdminBusiness")) {
                sql = "SELECT * FROM Admin WHERE account_staff_id = ?";
            } else {
                sql = "SELECT * FROM " + roleTable + " WHERE account_staff_id = ?";
            }

            PreparedStatement stmt = db.getConnection().prepareStatement(sql);
            stmt.setInt(1, account_staff_id);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                switch (role) {
                    case "Doctor" -> {
                        Doctor doctor = new Doctor(
                                rs.getInt("doctor_id"),
                                rs.getInt("account_staff_id"),
                                rs.getString("full_name"),
                                rs.getString("department"),
                                rs.getString("phone"),
                                rs.getString("eduLevel")
                        );
                        staffObject = doctor;
                    }
                    case "Receptionist" -> {
                        Receptionist receptionist = new Receptionist(
                                rs.getInt("receptionist_id"),
                                rs.getInt("account_staff_id"),
                                rs.getString("full_name"),
                                rs.getString("phone")
                        );
                        staffObject = receptionist;
                    }
                    case "AdminSystem" -> {
                        AdminSystem admin = new AdminSystem(
                                rs.getInt("admin_id"),
                                rs.getInt("account_staff_id"),
                                rs.getString("full_name"),
                                rs.getString("department"),
                                rs.getString("phone")
                        );
                        staffObject = admin;
                    }
                    case "AdminBusiness" -> {
                        AdminBusiness admin = new AdminBusiness(
                                rs.getInt("admin_id"),
                                rs.getInt("account_staff_id"),
                                rs.getString("full_name"),
                                rs.getString("department"),
                                rs.getString("phone")
                        );
                        staffObject = admin;
                    }
                }
            }

            rs.close();
            stmt.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return staffObject;
    }

    public List<Doctor> getAllDoctors() {
        List<Doctor> doctors = new ArrayList<>();
        String sql = "SELECT * FROM Doctor ORDER BY full_name";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Doctor doctor = new Doctor(
                        rs.getInt("doctor_id"),
                        rs.getInt("account_staff_id"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone"),
                        rs.getString("eduLevel")
                );
                doctors.add(doctor);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return doctors;
    }

}