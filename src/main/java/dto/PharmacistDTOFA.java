package dto;

public class PharmacistDTOFA {
    private int accountPharmacistId;
    private String username;
    private String password;
    private String email;
    private String status;
    private String img;

    private int pharmacistId;
    private String fullName;
    private String phone;
    private String eduLevel;

    public PharmacistDTOFA() {}

    public PharmacistDTOFA(int accountPharmacistId, String username, String password, String email, String status, String img,
                         int pharmacistId, String fullName, String phone, String eduLevel) {
        this.accountPharmacistId = accountPharmacistId;
        this.username = username;
        this.password = password;
        this.email = email;
        this.status = status;
        this.img = img;
        this.pharmacistId = pharmacistId;
        this.fullName = fullName;
        this.phone = phone;
        this.eduLevel = eduLevel;
    }

    public int getAccountPharmacistId() {
        return accountPharmacistId;
    }

    public void setAccountPharmacistId(int accountPharmacistId) {
        this.accountPharmacistId = accountPharmacistId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }

    public int getPharmacistId() {
        return pharmacistId;
    }

    public void setPharmacistId(int pharmacistId) {
        this.pharmacistId = pharmacistId;
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

    public String getEduLevel() {
        return eduLevel;
    }

    public void setEduLevel(String eduLevel) {
        this.eduLevel = eduLevel;
    }
}
