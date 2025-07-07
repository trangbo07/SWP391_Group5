package dto;

public class PatientDTOFA {
    private int patientId;
    private String fullName;
    private String dob;
    private String gender;
    private String phone;
    private String address;
    private int accountPatientId;

    public PatientDTOFA() {
    }

    public PatientDTOFA(int patientId, String fullName, String dob, String gender, String phone, String address, int accountPatientId) {
        this.patientId = patientId;
        this.fullName = fullName;
        this.dob = dob;
        this.gender = gender;
        this.phone = phone;
        this.address = address;
        this.accountPatientId = accountPatientId;
    }

    // Getters and Setters
    public int getPatientId() {
        return patientId;
    }

    public void setPatientId(int patientId) {
        this.patientId = patientId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public int getAccountPatientId() {
        return accountPatientId;
    }

    public void setAccountPatientId(int accountPatientId) {
        this.accountPatientId = accountPatientId;
    }
}
