package model;

import java.sql.Timestamp;

public class Appointment {
    private int appointment_id;
    private int doctor_id;
    private int patient_id;
<<<<<<< HEAD
    private Timestamp appointment_datetime;
=======
    private Timestamp appointment_date_time;
>>>>>>> fce8356 (List Appointment)
    private int receptionist_id;
    private String shift;
    private String status;
    private String note;

    public Appointment() {
    }

<<<<<<< HEAD
    public Appointment(int appointment_id, int doctor_id, int patient_id, Timestamp appointment_datetime, int receptionist_id, String shift,
                       String status, String note) {
        this.appointment_id = appointment_id;
        this.doctor_id = doctor_id;
        this.patient_id = patient_id;
        this.appointment_datetime = appointment_datetime;
=======
    public Appointment(int appointment_id, int doctor_id, int patient_id, Timestamp appointment_date_time,
                       int receptionist_id, String shift, String status, String note) {
        this.appointment_id = appointment_id;
        this.doctor_id = doctor_id;
        this.patient_id = patient_id;
        this.appointment_date_time = appointment_date_time;
>>>>>>> fce8356 (List Appointment)
        this.receptionist_id = receptionist_id;
        this.shift = shift;
        this.status = status;
        this.note = note;
    }

    public int getAppointment_id() {
        return appointment_id;
    }

    public void setAppointment_id(int appointment_id) {
        this.appointment_id = appointment_id;
    }

    public int getDoctor_id() {
        return doctor_id;
    }

    public void setDoctor_id(int doctor_id) {
        this.doctor_id = doctor_id;
    }

    public int getPatient_id() {
        return patient_id;
    }

    public void setPatient_id(int patient_id) {
        this.patient_id = patient_id;
    }

<<<<<<< HEAD
    public Timestamp getAppointment_datetime() {
        return appointment_datetime;
    }

    public void setAppointment_datetime(Timestamp appointment_datetime) {
        this.appointment_datetime = appointment_datetime;
=======
    public Timestamp getAppointment_date_time() {
        return appointment_date_time;
    }

    public void setAppointment_date_time(Timestamp appointment_date_time) {
        this.appointment_date_time = appointment_date_time;
>>>>>>> fce8356 (List Appointment)
    }

    public int getReceptionist_id() {
        return receptionist_id;
    }

    public void setReceptionist_id(int receptionist_id) {
        this.receptionist_id = receptionist_id;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
