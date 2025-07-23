package dto;

import java.sql.Timestamp;

public class StaffLogDTO {
    private int log_id;
    private int account_staff_id;
    private String action;
    private String action_type;
    private Timestamp log_time;
    private String role;           // Vai trò của nhân viên
    private String status;
    private String username;       // Tên đăng nhập của nhân viên

    public StaffLogDTO(int log_id, int account_staff_id, String action, String action_type, Timestamp log_time, String role, String status, String username) {
        this.log_id = log_id;
        this.account_staff_id = account_staff_id;
        this.action = action;
        this.action_type = action_type;
        this.log_time = log_time;
        this.role = role;
        this.status = status;
        this.username = username;
    }

    // Getters
    public int getLog_id() {
        return log_id;
    }

    public int getAccount_staff_id() {
        return account_staff_id;
    }

    public String getAction() {
        return action;
    }

    public String getAction_type() {
        return action_type;
    }

    public Timestamp getLog_time() {
        return log_time;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    public String getUsername() {
        return username;
    }

    // Setters
    public void setLog_id(int log_id) {
        this.log_id = log_id;
    }

    public void setAccount_staff_id(int account_staff_id) {
        this.account_staff_id = account_staff_id;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public void setAction_type(String action_type) {
        this.action_type = action_type;
    }

    public void setLog_time(Timestamp log_time) {
        this.log_time = log_time;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}