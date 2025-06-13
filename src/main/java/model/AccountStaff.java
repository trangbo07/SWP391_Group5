package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class AccountStaff {
    private int account_staff_id;
    private String username, password, email, role, img, status;
}
