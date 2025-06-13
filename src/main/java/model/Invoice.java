package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Invoice {
    private int invoice_id, patient_id, medicineRecord_id;
    private String issue_date, total_amount, status;
}
