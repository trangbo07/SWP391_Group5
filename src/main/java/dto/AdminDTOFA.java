package dto;

public class AdminDTOFA {
    // Từ bảng AccountStaff
    private int accountStaffId;
    private String username;
    private String password;
    private String role;
    private String email;
    private String img;
    private String status;

    // Từ bảng Admin
    private int adminId;
    private String fullName;
    private String department;
    private String phone;

    // Constructor
    public AdminDTOFA(int accountStaffId, String username, String password, String role, String email, String img,
                      String status, int adminId, String fullName, String department, String phone) {
        this.accountStaffId = accountStaffId;
        this.username = username;
        this.password = password;
        this.role = role;
        this.email = email;
        this.img = img;
        this.status = status;
        this.adminId = adminId;
        this.fullName = fullName;
        this.department = department;
        this.phone = phone;
    }

    // Getter và Setter
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public int getAdminId() {
        return adminId;
    }

    public void setAdminId(int adminId) {
        this.adminId = adminId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}

