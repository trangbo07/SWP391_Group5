package dao;

import dto.PatientLogDTO;
import model.SystemLog_Patient;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SystemLogPatientDAO {

    DBContext db = DBContext.getInstance();

    public void insertLog(SystemLog_Patient log) throws SQLException {
        String sql = "INSERT INTO SystemLog_Patient (account_patient_id, action, action_type) VALUES (?, ?, ?)";

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, log.getAccount_patient_id());
            ps.setNString(2, log.getAction());
            ps.setNString(3, log.getAction_type().toUpperCase());

            ps.executeUpdate();
        }
    }

    public List<PatientLogDTO> getPatientLogs(String searchTerm, String actionType) throws SQLException {
        List<PatientLogDTO> logs = new ArrayList<>();
        // Query này join với bảng Account_Patient để lấy username
        String sql = "SELECT slp.log_id, slp.account_patient_id, slp.action, slp.action_type, slp.log_time, ap.status, ap.username\n" +
                "                FROM SystemLog_Patient slp\n" +
                "                JOIN AccountPatient ap ON slp.account_patient_id = ap.account_patient_id\n" +
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

        sql += " ORDER BY slp.log_time DESC"; // Mặc định sắp xếp mới nhất trước

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int logId = rs.getInt("log_id");
                    int accountPatientId = rs.getInt("account_patient_id");
                    String action = rs.getNString("action");
                    String type = rs.getNString("action_type");
                    Timestamp logTime = rs.getTimestamp("log_time");
                    String status = rs.getNString("status");
                    String username = rs.getNString("username");

                    logs.add(new PatientLogDTO(logId, accountPatientId, action, type, logTime, status, username));
                }
            }
        }
        return logs;
    }
    public List<String> getDistinctActionTypes() throws SQLException {
        List<String> actionTypes = new ArrayList<>();
        String sql = "SELECT DISTINCT action_type FROM SystemLog_Patient ORDER BY action_type ASC"; // Sắp xếp theo thứ tự bảng chữ cái

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
