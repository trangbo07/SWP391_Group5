package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Prescription {
    private int prescription_id, medicineRecord_id, doctor_id;
    private String prescription_date, status;
}
