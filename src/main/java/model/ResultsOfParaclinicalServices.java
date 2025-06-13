package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ResultsOfParaclinicalServices {
    private int result_id, service_order_item_id;
    private String result_description, created_at;
}
