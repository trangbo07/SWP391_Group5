package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class AccountPatient {
    private int account_patient_id;
    private String username, password, email, img, status;
}
