package dao;
import model.DiagnosisDetails;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.sql.*;

public class DepartmentDAO {
    public List<String> getAllDepartments() throws Exception {
        List<String> list = new ArrayList<>();

        String sql = "SELECT DISTINCT department FROM Doctor";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(rs.getString("department"));
            }
        }

        return list;
    }
}
