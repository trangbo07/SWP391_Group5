package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopFeedbackDTO {
    private int doctorId;
    private String fullName;
    private String department;
    private String phone;
    private String eduLevel;
    private String img;           // đường dẫn ảnh bác sĩ
    private String content;       // nội dung feedback
    private String createdAt;     // thời gian tạo feedback (để dưới dạng String cho đơn giản)
}