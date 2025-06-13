package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Warehouse {
    private int warehouse_id;
    private String name, location;
}
