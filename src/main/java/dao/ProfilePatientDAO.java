package dao;

import dto.AccountPatientDTO;
import dto.PatientDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ProfilePatientDAO {

    public AccountPatientDTO getAccountPatientById(int accountPatientId) {
        String sql = """
            SELECT username, email, password, img 
            FROM AccountPatient 
            WHERE account_patient_id = ?
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, accountPatientId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                AccountPatientDTO account = new AccountPatientDTO();
                account.setAccountPatientId(accountPatientId); // do không có trong SELECT nhưng bạn đã biết từ tham số
                account.setUsername(rs.getString("username"));
                account.setEmail(rs.getString("email"));
                account.setPassword(rs.getString("password"));
                account.setImg(rs.getString("img")); // có thể là null
                return account;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
    public PatientDTO getPatientById(int patientId) {
        String sql = "SELECT * FROM Patient WHERE patient_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new PatientDTO(
                        rs.getInt("patient_id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("phone"),
                        rs.getString("address")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}
