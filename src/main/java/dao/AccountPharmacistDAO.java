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
}
