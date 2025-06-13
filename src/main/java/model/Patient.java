package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Patient {
    private int patient_id;
    private String full_name, dob, gender, phone, address;
}
