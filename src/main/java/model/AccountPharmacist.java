package model;

public class AccountPharmacist {
    private int account_pharmacist_id;
    private String username, password, email,img,status;

    public AccountPharmacist() {
    }

    public AccountPharmacist(int account_pharmacist_id, String username, String password, String email, String img, String status) {
        this.account_pharmacist_id = account_pharmacist_id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.img = img;
        this.status = status;
    }

    public int getAccount_pharmacist_id() {
        return account_pharmacist_id;
    }

    public void setAccount_pharmacist_id(int account_pharmacist_id) {
        this.account_pharmacist_id = account_pharmacist_id;
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
        return "AccountPatient{" +
                "account_pharmacist_id=" + account_pharmacist_id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", email='" + email + '\'' +
                ", img='" + img + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
