package dao;

import dto.PharmacistLogDTO;
import model.SystemLog_Pharmacist;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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

    public List<PharmacistLogDTO> getPharmacistLogs(String searchTerm, String actionType) throws SQLException {
        List<PharmacistLogDTO> logs = new ArrayList<>();
        // Query này join với bảng Account_Pharmacist để lấy username
        String sql = "SELECT slp.log_id, slp.account_pharmacist_id, slp.action, slp.action_type, slp.log_time, ap.status, ap.username\n" +
                "                FROM SystemLog_Pharmacist slp\n" +
                "                JOIN AccountPharmacist ap ON slp.account_pharmacist_id = ap.account_pharmacist_id\n" +
                "                WHERE 1=1";

        List<Object> params = new ArrayList<>();

        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            sql += " AND (slp.action LIKE ? OR slp.action_type LIKE ? OR ap.username LIKE ? OR CONVERT(NVARCHAR, slp.log_id) LIKE ?)";
            String likeTerm = "%" + searchTerm.trim() + "%";
            params.add(likeTerm);
            params.add(likeTerm);
            params.add(likeTerm);
            params.add(likeTerm);
        }
        if (actionType != null && !actionType.trim().isEmpty() && !"Tất cả hành động".equalsIgnoreCase(actionType)) {
            sql += " AND slp.action_type = ?";
            params.add(actionType.toUpperCase());
        }

        sql += " ORDER BY slp.log_time DESC";

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int logId = rs.getInt("log_id");
                    int accountPharmacistId = rs.getInt("account_pharmacist_id");
                    String action = rs.getNString("action");
                    String type = rs.getNString("action_type");
                    Timestamp logTime = rs.getTimestamp("log_time");
                    String status = rs.getNString("status");
                    String username = rs.getNString("username");

                    logs.add(new PharmacistLogDTO(logId, accountPharmacistId, action, type, logTime, status, username));
                }
            }
        }
        return logs;
    }

    public List<String> getDistinctActionTypes() throws SQLException {
        List<String> actionTypes = new ArrayList<>();
        String sql = "SELECT DISTINCT action_type FROM SystemLog_Pharmacist ORDER BY action_type ASC";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                actionTypes.add(rs.getNString("action_type"));
            }
        }
        return actionTypes;
    }
}
