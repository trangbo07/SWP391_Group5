package dao;
import model.MedicineRecord;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MedicineRecordDAO  {
    public static List<MedicineRecord> getRecordsByPatientId(int patientId) {
        DBContext db = DBContext.getInstance();
        List<MedicineRecord> records = new ArrayList<>();

        try {
            String sql = """
                         SELECT medicineRecord_id, patient_id
                         FROM MedicineRecords
                         WHERE patient_id = ?
                         """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, patientId);

            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                MedicineRecord record = new MedicineRecord(
                        rs.getInt("medicineRecord_id"),
                        rs.getInt("patient_id")
                );
                records.add(record);
            }
        } catch (Exception e) {
            return null;
        }

        return records;
    }
}
