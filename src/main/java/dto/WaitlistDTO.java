package dto;

public class WaitlistDTO {
    private int waitlist_id;
    private int patient_id;
    private int doctor_id;
    private String status;
    private int room_id;
    private String registered_at;
    private String estimated_time;
    private String visittype;

    // Từ bảng Appointment
    private String appointment_datetime;
    private String note;
    private String shift;
    private int appointment_id;

    // Từ bảng Patient
    private String full_name;
    private String dob;
    private String gender;
    private String phone;
    
    // Từ bảng MedicineRecords
    private int medicine_record_id;

    public int getAppointment_id() {
        return appointment_id;
    }

    public void setAppointment_id(int appointment_id) {
        this.appointment_id = appointment_id;
    }

    public String getFull_name() {
        return full_name;
    }

    public void setFull_name(String full_name) {
        this.full_name = full_name;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // --- Getters & Setters ---
    public int getWaitlist_id() {
        return waitlist_id;
    }

    public void setWaitlist_id(int waitlist_id) {
        this.waitlist_id = waitlist_id;
    }

    public int getPatient_id() {
        return patient_id;
    }

    public void setPatient_id(int patient_id) {
        this.patient_id = patient_id;
    }

    public int getDoctor_id() {
        return doctor_id;
    }

    public void setDoctor_id(int doctor_id) {
        this.doctor_id = doctor_id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getRoom_id() {
        return room_id;
    }

    public void setRoom_id(int room_id) {
        this.room_id = room_id;
    }

    public String getRegistered_at() {
        return registered_at;
    }

    public void setRegistered_at(String registered_at) {
        this.registered_at = registered_at;
    }

    public String getEstimated_time() {
        return estimated_time;
    }

    public void setEstimated_time(String estimated_time) {
        this.estimated_time = estimated_time;
    }

    public String getVisittype() {
        return visittype;
    }

    public void setVisittype(String visittype) {
        this.visittype = visittype;
    }

    public String getAppointment_datetime() {
        return appointment_datetime;
    }

    public void setAppointment_datetime(String appointment_datetime) {
        this.appointment_datetime = appointment_datetime;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public int getMedicine_record_id() {
        return medicine_record_id;
    }

    public void setMedicine_record_id(int medicine_record_id) {
        this.medicine_record_id = medicine_record_id;
    }
}
