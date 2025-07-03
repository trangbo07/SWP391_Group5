package dto;

public class DoctorDetailsDTO {
    private String fullName;
    private String phone;
    private String department;
    private String eduLevel;
    private String username;
    private String role;
    private String email;
    private String img;

    // Default constructor
    public DoctorDetailsDTO() {}

    // Parameterized constructor
    public DoctorDetailsDTO(String fullName, String phone, String department, String eduLevel,
                            String username, String role, String email, String img) {
        this.fullName = fullName;
        this.phone = phone;
        this.department = department;
        this.eduLevel = eduLevel;
        this.username = username;
        this.role = role;
        this.email = email;
        this.img = img;
    }

    // Getters and Setters
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

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getEduLevel() {
        return eduLevel;
    }

    public void setEduLevel(String eduLevel) {
        this.eduLevel = eduLevel;
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

}