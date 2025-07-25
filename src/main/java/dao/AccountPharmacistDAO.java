package dao;

import model.AccountPharmacist;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import util.PasswordHasherSHA256Util;

public class AccountPharmacistDAO {
    public static AccountPharmacist checkLogin(String username, String password) {
        DBContext db = DBContext.getInstance();
        AccountPharmacist pharmacist = null;

        try {
            String hashedPassword = PasswordHasherSHA256Util.hashPassword(password);
            String sql = """    
                         SELECT * FROM AccountPharmacist WHERE (username = ? OR email = ?) AND password = ?
                         """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, username);
            statement.setString(2, username);
            statement.setString(3, hashedPassword);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                pharmacist = new AccountPharmacist(
                        rs.getInt("account_pharmacist_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status")

                );
            }
        } catch (Exception e) {
            return null;
        }

        return pharmacist;
    }
    public static boolean checkAccountPharmacist(String uoe) {
        DBContext db = DBContext.getInstance();

        try {
            String sql = """
                     SELECT * FROM AccountPharmacist 
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

    public static AccountPharmacist getAccountByPharmacistId(int pharmacistId) {
        DBContext db = DBContext.getInstance();
        AccountPharmacist pharmacist = null;

        try {
            String sql = """    
                         SELECT * FROM AccountPharmacist WHERE account_pharmacist_id = ?
                         """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, pharmacistId);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                pharmacist = new AccountPharmacist(
                        rs.getInt("account_pharmacist_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status")

                );
            }
        } catch (Exception e) {
            return null;
        }

        return pharmacist;
    }

    public static boolean updatePassword(String email, String newPassword) {
        DBContext db = DBContext.getInstance();

        try {
            String sql = "UPDATE AccountPharmacist SET password = ? WHERE email = ?";
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ps.setString(1, PasswordHasherSHA256Util.hashPassword(newPassword)); // hash password before saving
            ps.setString(2, email);
            int rowsAffected = ps.executeUpdate();
            ps.close();
            return rowsAffected > 0;
        } catch (Exception e) {
            System.err.println("Error updating password: " + e.getClass().getName() + " - " + e.getMessage());
            return false;
        }
    }
    public static AccountPharmacist getAccountByEmailOrUsername(String emailOrUsername) {
        DBContext db = DBContext.getInstance();
        AccountPharmacist pharmacist = null;

        try {
            String sql = """
                     SELECT * FROM AccountPharmacist 
                     WHERE username = ? OR email = ?
                     """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, emailOrUsername);
            statement.setString(2, emailOrUsername);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                pharmacist = new AccountPharmacist(
                        rs.getInt("account_pharmacist_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
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

        return pharmacist;
    }
}
