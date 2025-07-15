package dao;

import dto.AccountPatientDTO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class AccountPatientDAOFA {
    private DBContext db = DBContext.getInstance();

    public List<AccountPatientDTO> getAllAccounts() throws SQLException {
        List<AccountPatientDTO> list = new ArrayList<>();
        String sql = "SELECT * FROM AccountPatient";
        PreparedStatement ps = db.getConnection().prepareStatement(sql);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            AccountPatientDTO acc = new AccountPatientDTO();
            acc.setAccountPatientId(rs.getInt("account_patient_id"));
            acc.setUsername(rs.getString("username"));
            acc.setPassword(rs.getString("password"));
            acc.setEmail(rs.getString("email"));
            acc.setImg(rs.getString("img"));
            acc.setStatus(rs.getString("status"));
            list.add(acc);
        }
        return list;
    }

    public AccountPatientDTO getAccountById(int id) throws SQLException {
        String sql = "SELECT * FROM AccountPatient WHERE account_patient_id = ?";
        PreparedStatement ps = db.getConnection().prepareStatement(sql);
        ps.setInt(1, id);
        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            AccountPatientDTO acc = new AccountPatientDTO();
            acc.setAccountPatientId(rs.getInt("account_patient_id"));
            acc.setUsername(rs.getString("username"));
            acc.setPassword(rs.getString("password"));
            acc.setEmail(rs.getString("email"));
            acc.setImg(rs.getString("img"));
            acc.setStatus(rs.getString("status"));
            return acc;
        }
        return null;
    }

    public List<String> getDistinctValues(String field) throws SQLException {
        List<String> list = new ArrayList<>();

        if (!List.of("status").contains(field)) {
            return list;
        }

        String sql = "SELECT DISTINCT " + field + " FROM AccountPatient";
        PreparedStatement ps = db.getConnection().prepareStatement(sql);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            String value = rs.getString(field);
            if (value != null) list.add(value);
        }
        return list;
    }

    public List<AccountPatientDTO> filterAccountPatients(String status, String keyword) throws SQLException {
        List<AccountPatientDTO> list = new ArrayList<>();

        StringBuilder sql = new StringBuilder("""
                                                SELECT * FROM AccountPatient WHERE 1=1
                                                """);
        List<Object> params = new ArrayList<>();

        if (status != null && !status.isEmpty()) {
            sql.append(" AND status = ?");
            params.add(status);
        }

        if (keyword != null && !keyword.isEmpty()) {
            sql.append(" AND username LIKE ?");
            params.add("%" + keyword + "%");
        }

        sql.append(" ORDER BY account_patient_id DESC");

        PreparedStatement ps = db.getConnection().prepareStatement(sql.toString());
        for (int i = 0; i < params.size(); i++) {
            ps.setObject(i + 1, params.get(i));
        }


        ResultSet rs = ps.executeQuery();
        while (rs.next()) {
            AccountPatientDTO acc = new AccountPatientDTO();
            acc.setAccountPatientId(rs.getInt("account_patient_id"));
            acc.setUsername(rs.getString("username"));
            acc.setPassword(rs.getString("password"));
            acc.setEmail(rs.getString("email"));
            acc.setImg(rs.getString("img"));
            acc.setStatus(rs.getString("status"));
            list.add(acc);
        }

        return list;
    }

    public boolean isEmailOrUsernameDuplicated(String newUsername, String newEmail, String oldUsername, String oldEmail) {
        String sql = """
                    SELECT TOP 1 1
                    FROM (
                        SELECT email, username FROM AccountPatient
                    ) AS sub
                    WHERE (email = ? AND email != ?)
                       OR (username = ? AND username != ?)
                """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, newEmail);
            ps.setString(2, oldEmail);
            ps.setString(3, newUsername);
            ps.setString(4, oldUsername);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    public boolean insertAccountPatient(String username, String password, String email, String img, String status) {
        String sql = "INSERT INTO AccountPatient (username, password, email, img, status) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = db.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, password); // nên mã hóa nếu cần
            ps.setString(3, email);
            ps.setString(4, img);
            ps.setString(5, status);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateAccountPatient(int id, String username, String email, String img, String status) {
        String sql = "UPDATE AccountPatient SET username = ?, email = ?, img = ?, status = ? WHERE account_patient_id = ?";
        try (Connection con = db.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, email);
            ps.setString(3, img);
            ps.setString(4, status);
            ps.setInt(5, id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean resetPatientPassword(int accountPatientId, String newPassword) {
        String sql = "UPDATE AccountPatient SET password = ? WHERE account_patient_id = ?";
        try (Connection con = db.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, newPassword); // nên hash nếu cần
            ps.setInt(2, accountPatientId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateStatus(int id, String newStatus) {
        String sql = "UPDATE AccountPatient SET status = ? WHERE account_patient_id = ?";
        try (Connection con = db.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, newStatus);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}
