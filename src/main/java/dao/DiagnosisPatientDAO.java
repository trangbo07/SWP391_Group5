package dao;

import model.DiagnosisDetails;
import model.DiagnosisPatient;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class DiagnosisPatientDAO {
    public List<DiagnosisPatient> getDiagnosisByAccountIdAndName(int accountId ) {
        DBContext db = DBContext.getInstance();
        List<DiagnosisPatient> list = new ArrayList<>();

        try {
            String sql = """
                                                    SELECT
                                                        doc.full_name,
                                                        p.dob,
                                                        p.gender,
                                                        d.disease,
                                                        d.conclusion,
                                                        d.treatment_plan
                                                    FROM Patient p
                                                    JOIN MedicineRecords m ON p.patient_id = m.patient_id
                                                    JOIN Diagnosis d ON d.medicineRecord_id = m.medicineRecord_id
                            						JOIN Doctor doc ON doc.doctor_id = d.doctor_id
                                                    WHERE p.patient_id = ?
                                                    ORDER BY doc.full_name;
            """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, accountId);
            ResultSet rs = statement.executeQuery();

            while (rs.next()) {
                DiagnosisPatient detail = new DiagnosisPatient(
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("disease"),
                        rs.getString("conclusion"),
                        rs.getString("treatment_plan")
                );
                list.add(detail);
            }
        System.out.println(list);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return list.isEmpty() ? null : list;
    }
}
