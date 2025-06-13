package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Medicine {
    private int medicine_id, unit_id, category_id, quantity;
    private String name, ingredient, usage, preservation, manuDate, expDate, warehouse_id;
    private double price;
}
