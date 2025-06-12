package dao;

import model.AccountPatient;
import java.sql.*;

public class AccountPatientDAO {
    public static AccountPatient checkLogin(String username, String password) {
        DBContext db = DBContext.getInstance();
        AccountPatient patient = null;

        try {
            String sql = """    
                         SELECT * FROM AccountPatient WHERE (username = ? OR email = ?) AND password = ?
                         """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, username);
            statement.setString(2, username);
            statement.setString(3, password);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                patient = new AccountPatient(
                        rs.getInt("account_patient_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("status")
                );
            }
        } catch (Exception e) {
            return null;
        }

        return patient;
    }

    public static boolean registerPatient(String username ,String email, String password, String status) {
        DBContext db = DBContext.getInstance();

        try {
            // Kiểm tra email đã tồn tại chưa
            String checkSql = "SELECT COUNT(*) FROM AccountPatient WHERE email = ?";
            PreparedStatement checkStmt = db.getConnection().prepareStatement(checkSql);
            checkStmt.setString(1, email);
            ResultSet rs = checkStmt.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                return false; // Email đã tồn tại
            }

            // Chưa tồn tại → thêm mới
            String sql = "INSERT INTO AccountPatient(username, password, email, status) VALUES (?, ?, ?, ?)";
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ps.setString(1, username);
            ps.setString(2, password);
            ps.setString(3, email);
            ps.setString(4, status);

            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;

        } catch (Exception e) {
            System.err.println("Lỗi khi đăng ký: " + e.getClass().getName() + " - " + e.getMessage());
            return false;
        }
    }

    public static boolean updatePassword(String email, String newPassword) {
        DBContext db = DBContext.getInstance();

        try {
            String sql = "UPDATE AccountPatient SET password = ? WHERE email = ?";
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

    public static AccountPatient getAccountByEmailOrUsername(String emailOrUsername) {
        DBContext db = DBContext.getInstance();
        AccountPatient patient = null;

        try {
            String sql = """
                     SELECT * FROM AccountPatient 
                     WHERE username = ? OR email = ?
                     """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, emailOrUsername);
            statement.setString(2, emailOrUsername);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                patient = new AccountPatient(
                        rs.getInt("account_patient_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("status")
                );
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return patient;
    }

}

