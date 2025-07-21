package dto;

public class AppointmentDTO {
    private int appointment_id;
    private String appointment_datetime;
    private String shift;
    private String status;
    private String note;
    private int doctor_id;

    private int patient_id;
    private String full_name;
    private String dob;
    private String gender;
    private String phone;

    private String doctor_full_name;
    private String doctor_department;

    // Constructors
    public AppointmentDTO() {
    }

    public AppointmentDTO(int appointmentId, String appointmentDatetime, String shift, String status, String note,
                          int patientId, String patientFullName, String patientDob, String patientGender, String patientPhone) {
        this.appointment_id = appointmentId;
        this.appointment_datetime = appointmentDatetime;
        this.shift = shift;
        this.status = status;
        this.note = note;
        this.patient_id = patientId;
        this.full_name = patientFullName;
        this.dob = patientDob;
        this.gender = patientGender;
        this.phone = patientPhone;
    }

    public String getDoctor_full_name() {
        return doctor_full_name;
    }

    public void setDoctor_full_name(String doctor_full_name) {
        this.doctor_full_name = doctor_full_name;
    }

    public String getDoctor_department() {
        return doctor_department;
    }

    public void setDoctor_department(String doctor_department) {
        this.doctor_department = doctor_department;
    }

    public int getAppointment_id() {
        return appointment_id;
    }

    public void setAppointment_id(int appointment_id) {
        this.appointment_id = appointment_id;
    }

    public String getAppointment_datetime() {
        return appointment_datetime;
    }

    public void setAppointment_datetime(String appointment_datetime) {
        this.appointment_datetime = appointment_datetime;
    }
    public int getDoctor_id() { return doctor_id; }
    public void setDoctor_id(int doctor_id) { this.doctor_id = doctor_id; }
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

    public int getPatient_id() {
        return patient_id;
    }

    public void setPatient_id(int patient_id) {
        this.patient_id = patient_id;
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
}
