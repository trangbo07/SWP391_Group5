package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ServiceOrder {
    private int service_order_id, doctor_id, medicineRecord_id;
    private String order_date;
}
