package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Medicines {
    private int prescription_invoice_id, medicine_id, quantity;
    private String dosage;
}
