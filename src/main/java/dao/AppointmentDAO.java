package dao;

import model.Appointment;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class AppointmentDAO {

    public static List<Appointment> getAppointmentsByPatientId(int patientId) {
        DBContext db = DBContext.getInstance();
        List<Appointment> appointments = new ArrayList<>();

        try {
            String sql = """
                         SELECT appointment_id, doctor_id, patient_id, receptionist_id,
                                appointment_datetime, shift, status, note
                         FROM Appointment
                         WHERE patient_id = ?
                         """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, patientId);

            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                appointments.add(new Appointment(
                        rs.getInt("appointment_id"),
                        rs.getInt("doctor_id"),
                        rs.getInt("patient_id"),
                        rs.getTimestamp("appointment_datetime"),
                        rs.getInt("receptionist_id"),
                        rs.getString("shift"),
                        rs.getString("status"),
                        rs.getString("note")
                ));
            }

        } catch (Exception e) {
            return null;
        }

        return appointments;
    }
}
