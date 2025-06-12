package dao;

import model.AccountStaff;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AccountStaffDAO {
    public static AccountStaff checkLogin(String username, String password) {
        DBContext db = DBContext.getInstance();
        AccountStaff staff = null;

        try {
            String sql = """    
                         SELECT * FROM AccountStaff WHERE (username = ? OR email = ?) AND password = ?
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
                        rs.getString("role"),
                        rs.getString("email"),
                        rs.getString("status"),
                        rs.getString("img")
                );
            }
        } catch (Exception e) {
            return null;
        }

        return staff;
    }
    public static boolean checkAccountStaff(String username, String email) {
        DBContext db = DBContext.getInstance();

        try {
            String sql = """
                     SELECT * FROM AccountStaff 
                     WHERE username = ? OR email = ?
                     """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, username);
            statement.setString(2, email);

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


    public static boolean updatePassword(String email, String newPassword) {
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

    public static AccountStaff getAccountByEmailOrUsername(String emailOrUsername) {
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
                        rs.getString("role"),
                        rs.getString("email"),
                        rs.getString("status"),
                        rs.getString("img")
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

}
