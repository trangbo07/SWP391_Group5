package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ServiceInvoice {
    private int service_invoice_id, invoice_id, service_order_item_id, quantity;
    private double unit_price, total_price;
}
