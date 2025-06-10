package dao;

import model.AccountPharmacist;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AccountPharmacistDAO {
    public static AccountPharmacist checkLogin(String username, String password) {
        DBContext db = DBContext.getInstance();
        AccountPharmacist pharmacist = null;

        try {
            String sql = """    
                         SELECT * FROM AccountPharmacist WHERE (username = ? OR email = ?) AND password = ?
                         """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, username);
            statement.setString(2, username);
            statement.setString(3, password);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                pharmacist = new AccountPharmacist(
                        rs.getInt("account_pharmacist_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("status"),
                        rs.getString("img")
                );
            }
        } catch (Exception e) {
            return null;
        }

        return pharmacist;
    }
    public static boolean checkAccountPharmacist(String username, String email) {
        DBContext db = DBContext.getInstance();

        try {
            String sql = """
                     SELECT * FROM AccountPharmacist 
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
}
