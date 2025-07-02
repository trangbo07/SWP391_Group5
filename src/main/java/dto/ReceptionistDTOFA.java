package dto;

public class ReceptionistDTOFA {
    private int accountStaffId;
    private String username;
    private String role;
    private String email;
    private String img;
    private String status;
    private int receptionistId;
    private String fullName;
    private String phone;
    private String password;

    public ReceptionistDTOFA() {
    }

    public ReceptionistDTOFA(int accountStaffId, String username, String role, String email, String img, String status, int receptionistId, String fullName, String phone, String password) {
        this.accountStaffId = accountStaffId;
        this.username = username;
        this.role = role;
        this.email = email;
        this.img = img;
        this.status = status;
        this.receptionistId = receptionistId;
        this.fullName = fullName;
        this.phone = phone;
        this.password = password;
    }

    public int getAccountStaffId() {
        return accountStaffId;
    }

    public void setAccountStaffId(int accountStaffId) {
        this.accountStaffId = accountStaffId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getReceptionistId() {
        return receptionistId;
    }

    public void setReceptionistId(int receptionistId) {
        this.receptionistId = receptionistId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "ReceptionistDTOFA{" +
                "accountStaffId=" + accountStaffId +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                ", email='" + email + '\'' +
                ", img='" + img + '\'' +
                ", status='" + status + '\'' +
                ", receptionistId=" + receptionistId +
                ", fullName='" + fullName + '\'' +
                ", phone='" + phone + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}