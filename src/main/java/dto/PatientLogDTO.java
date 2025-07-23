package dto;

import java.sql.Timestamp; // Sử dụng Timestamp để dễ dàng lấy từ ResultSet

public class PatientLogDTO {
    private int log_id; // ID của bản ghi nhật ký
    private int account_patient_id; // ID tài khoản bệnh nhân liên quan
    private String action;          // Mô tả hành động (ví dụ: "đăng nhập", "cập nhật thông tin")
    private String action_type;     // Loại hành động (ví dụ: "LOGIN", "UPDATE", "CREATE", "DELETE")
    private Timestamp log_time;     // Thời gian ghi nhật ký
    private String status;          // Trạng thái của hành động (ví dụ: "Success", "Failed")
    private String username;        // Tên đăng nhập của bệnh nhân (để hiển thị trực tiếp)

    // Constructor
    public PatientLogDTO(int log_id, int account_patient_id, String action, String action_type, Timestamp log_time, String status, String username) {
        this.log_id = log_id;
        this.account_patient_id = account_patient_id;
        this.action = action;
        this.action_type = action_type;
        this.log_time = log_time;
        this.status = status;
        this.username = username;
    }

    // Getters (Gson sẽ tự động sử dụng getters để chuyển đổi sang JSON)
    public int getLog_id() {
        return log_id;
    }

    public int getAccount_patient_id() {
        return account_patient_id;
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

    public String getStatus() {
        return status;
    }

    public String getUsername() {
        return username;
    }

    // Setters (Không bắt buộc nếu chỉ dùng để truyền dữ liệu đi)
    public void setLog_id(int log_id) {
        this.log_id = log_id;
    }

    public void setAccount_patient_id(int account_patient_id) {
        this.account_patient_id = account_patient_id;
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

    public void setStatus(String status) {
        this.status = status;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}