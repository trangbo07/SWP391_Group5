package model;

public class AccountStaff {
    private int account_staff_id;
    private String username, password, email, role, img, status;

    public AccountStaff() {
    }

    public AccountStaff(int account_staff_id, String username, String password, String email, String role, String img, String status) {
        this.status = status;
        this.img = img;
        this.role = role;
        this.email = email;
        this.password = password;
        this.username = username;
        this.account_staff_id = account_staff_id;
    }

    public int getAccount_staff_id() {
        return account_staff_id;
    }

    public void setAccount_staff_id(int account_staff_id) {
        this.account_staff_id = account_staff_id;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    @Override
    public String toString() {
        return "AccountStaff{" +
                "account_staff_id=" + account_staff_id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", img='" + img + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
