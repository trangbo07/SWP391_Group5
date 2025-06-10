package dao;

import model.Appointment;

<<<<<<< HEAD
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
=======
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
>>>>>>> fce8356 (List Appointment)
import java.util.ArrayList;
import java.util.List;

public class AppointmentDAO {
<<<<<<< HEAD

    public static List<Appointment> getAppointmentsByPatientId(int patientId) {
        DBContext db = DBContext.getInstance();
        List<Appointment> appointments = new ArrayList<>();

        try {
=======
    public static List<Appointment> getAppointmentsByPatientID(int patient_id) {
        DBContext db = DBContext.getInstance();
        List<Appointment> appointments = new ArrayList<>();

        try{
>>>>>>> fce8356 (List Appointment)
            String sql = """
                         SELECT appointment_id, doctor_id, patient_id, receptionist_id,
                                appointment_datetime, shift, status, note
                         FROM Appointment
                         WHERE patient_id = ?
                         """;
<<<<<<< HEAD

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, patientId);

            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                appointments.add(new Appointment(
                        rs.getInt("appointment_id"),
                        rs.getInt("doctor_id"),
                        rs.getInt("patient_id"),
                        rs.getTimestamp("appointment_datetime"),
=======
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, patient_id);

            ResultSet rs = statement.executeQuery();
            while(rs.next()){
                appointments.add(new  Appointment(
                        rs.getInt("appointment_id"),
                        rs.getInt("doctor_id"),
                        rs.getInt("patient_id"),
                        rs.getTimestamp("appointment_date_time"),
>>>>>>> fce8356 (List Appointment)
                        rs.getInt("receptionist_id"),
                        rs.getString("shift"),
                        rs.getString("status"),
                        rs.getString("note")
                ));
            }
<<<<<<< HEAD

        } catch (Exception e) {
=======
        } catch (SQLException e) {
>>>>>>> fce8356 (List Appointment)
            return null;
        }

        return appointments;
    }
}
