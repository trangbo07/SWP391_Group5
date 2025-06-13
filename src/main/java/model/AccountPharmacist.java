package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class AccountPharmacist {
    private int account_pharmacist_id;
    private String username, password, email,img ,status;
}
