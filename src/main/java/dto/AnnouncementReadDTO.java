package dto;

public class AnnouncementReadDTO {
    private int announcementId;
    private String title;
    private String content;
    private String createdAt;

    // Thêm các trường từ AnnouncementDTO
    private int adminId;
    private String fullName;
    private String department;
    private String phone;
    private int accountStaffId;

    // Trạng thái đọc
    private boolean isRead;

    public AnnouncementReadDTO(int announcementId, String title,
                               String content, String createdAt,
                               int adminId, String fullName,
                               String department, String phone,
                               int accountStaffId, boolean isRead) {
        this.announcementId = announcementId;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.adminId = adminId;
        this.fullName = fullName;
        this.department = department;
        this.phone = phone;
        this.accountStaffId = accountStaffId;
        this.isRead = isRead;
    }

    public AnnouncementReadDTO() {}

    // getters và setters cho tất cả các trường

    public int getAnnouncementId() {
        return announcementId;
    }
    public void setAnnouncementId(int announcementId) {
        this.announcementId = announcementId;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public String getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
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
    public int getAccountStaffId() {
        return accountStaffId;
    }
    public void setAccountStaffId(int accountStaffId) {
        this.accountStaffId = accountStaffId;
    }
    public boolean isRead() {
        return isRead;
    }
    public void setRead(boolean read) {
        isRead = read;
    }

    @Override
    public String toString() {
        return "AnnouncementReadDTO{" +
                "announcementId=" + announcementId +
                ", title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", createdAt=" + createdAt +
                ", adminId=" + adminId +
                ", fullName='" + fullName + '\'' +
                ", department='" + department + '\'' +
                ", phone='" + phone + '\'' +
                ", accountStaffId=" + accountStaffId +
                ", isRead=" + isRead +
                '}';
    }
}
