package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Doctor {
    private int doctor_id, account_staff_id;
    private String full_name, department, phone, eduLevel;
}
