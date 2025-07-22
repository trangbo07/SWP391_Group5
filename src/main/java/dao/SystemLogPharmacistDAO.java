package dao;

import model.SystemLog_Pharmacist;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class SystemLogPharmacistDAO {

    public DBContext db = DBContext.getInstance();

    public void insertLog(SystemLog_Pharmacist log) throws SQLException {
        String sql = "INSERT INTO SystemLog_Pharmacist (account_pharmacist_id, action, action_type) VALUES (?, ?, ?)";

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, log.getAccount_pharmacist_id());
            ps.setNString(2, log.getAction());
            ps.setNString(3, log.getAction_type().toUpperCase());

            ps.executeUpdate();
        }
    }
}
