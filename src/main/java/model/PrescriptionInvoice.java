package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class PrescriptionInvoice {
    private int prescription_invoice_id, invoice_id, pharmacist_id, prescription_id;
}
