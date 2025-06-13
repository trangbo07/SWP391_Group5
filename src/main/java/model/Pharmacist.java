package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Pharmacist {
    private int pharmacist_id;
    private String full_name, department, phone, account_pharmacist_id;
}
