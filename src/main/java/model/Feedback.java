package model;

import lombok.*;
import java.sql.Timestamp;
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Feedback {
    private int feedback_id;
    private int patient_id;
    private String content;
    private Timestamp created_at;
    private String created_at_formatted;
    private String doctor_name; // tạm dùng cho patient_name
}

