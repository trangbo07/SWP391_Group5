package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Diagnosis {
    private int diagnosis_id, doctor_id, medicineRecord_id;
    private String conclusion, disease, treatment_plan;
}
