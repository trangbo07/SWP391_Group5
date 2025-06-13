package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Payment {
    private int payment_id, invoice_id;
    private String payment_type, payment_date, status;
    private double amount;
}
