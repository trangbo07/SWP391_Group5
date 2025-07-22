package dao;

import model.SystemLog_Staff;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class SystemLogStaffDAO {

    DBContext db = DBContext.getInstance();

    public void insertLog(SystemLog_Staff log) throws SQLException {
        String sql = "INSERT INTO SystemLog_Staff (account_staff_id, action, action_type) VALUES (?, ?, ?)";

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, log.getAccount_staff_id());
            ps.setNString(2, log.getAction());
            ps.setNString(3, log.getAction_type().toUpperCase());

            ps.executeUpdate();
        }
    }
}
