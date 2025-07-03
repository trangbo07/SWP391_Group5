package model;

import lombok.*;

@NoArgsConstructor
@Getter
@Setter
@ToString
public class Invoice {
    private int invoice_id, patient_id, medicineRecord_id;
    private String issue_date, status;
    private double total_amount;

    public Invoice(int invoice_id, int patient_id, int medicineRecord_id, String issue_date, double total_amount, String status) {
        this.invoice_id = invoice_id;
        this.patient_id = patient_id;
        this.medicineRecord_id = medicineRecord_id;
        this.issue_date = issue_date;
        this.total_amount = total_amount;
        this.status = status;
    }
}
