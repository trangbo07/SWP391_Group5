package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ListOfMedicalService {
    private int service_id;
    private String name, description;
    private double price;
}
