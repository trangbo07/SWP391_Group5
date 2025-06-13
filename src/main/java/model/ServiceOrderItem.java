package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ServiceOrderItem {
    private int service_order_item_id, service_order_id, service_id, doctor_id;
}
