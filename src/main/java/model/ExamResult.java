package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ExamResult {
    private int exam_result_id, medicineRecord_id, doctor_id;
    private String preliminary_diagnosis, symptoms;
}
