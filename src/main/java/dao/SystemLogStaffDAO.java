package dao;

import dto.StaffLogDTO;
import model.SystemLog_Staff;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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

    public List<StaffLogDTO> getStaffLogs(String searchTerm, String actionType, String role) throws SQLException { // Đã thêm 'String role'
        List<StaffLogDTO> logs = new ArrayList<>();
        // Query này join với bảng Account_Staff để lấy username và role
        String sql = "SELECT sls.log_id, sls.account_staff_id, sls.action, sls.action_type, sls.log_time, asa.username, asa.role, asa.status\n" +
                "                FROM SystemLog_Staff sls\n" +
                "                JOIN AccountStaff asa ON sls.account_staff_id = asa.account_staff_id\n" +
                "                WHERE 1=1";

        List<Object> params = new ArrayList<>();

        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            sql += " AND (sls.action LIKE ? OR sls.action_type LIKE ? OR asa.username LIKE ? OR asa.role LIKE ? OR CONVERT(NVARCHAR, sls.log_id) LIKE ?)";
            String likeTerm = "%" + searchTerm.trim() + "%";
            params.add(likeTerm);
            params.add(likeTerm);
            params.add(likeTerm);
            params.add(likeTerm); // Tham số cho asa.role LIKE ?
            params.add(likeTerm);
        }
        if (actionType != null && !actionType.trim().isEmpty() && !"Tất cả hành động".equalsIgnoreCase(actionType)) {
            sql += " AND sls.action_type = ?";
            params.add(actionType.toUpperCase());
        }
        if (role != null && !role.trim().isEmpty() && !"Tất cả vai trò".equalsIgnoreCase(role)) {
            sql += " AND asa.role = ?";
            params.add(role.toUpperCase());
        }

        sql += " ORDER BY sls.log_time DESC";

        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int logId = rs.getInt("log_id");
                    int accountStaffId = rs.getInt("account_staff_id");
                    String action = rs.getNString("action");
                    String type = rs.getNString("action_type");
                    Timestamp logTime = rs.getTimestamp("log_time");
                    String status = rs.getNString("status");
                    String username = rs.getNString("username");
                    String staffRole = rs.getNString("role"); // Đảm bảo lấy đúng tên cột 'role'

                    logs.add(new StaffLogDTO(logId, accountStaffId, action, type, logTime, staffRole, status, username));
                }
            }
        }
        return logs;
    }

    public List<String> getDistinctRoles() throws SQLException {
        List<String> roles = new ArrayList<>();
        String sql = "SELECT DISTINCT role FROM AccountStaff ORDER BY role ASC";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                roles.add(rs.getNString("role"));
            }
        }
        return roles;
    }

    public List<String> getDistinctActionTypes() throws SQLException {
        List<String> actionTypes = new ArrayList<>();
        String sql = "SELECT DISTINCT action_type FROM SystemLog_Staff ORDER BY action_type ASC"; // Sắp xếp theo thứ tự bảng chữ cái

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
