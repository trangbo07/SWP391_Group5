package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Feedback {
    private int feedback_id, patient_id;
    private String content, created_at;
}
