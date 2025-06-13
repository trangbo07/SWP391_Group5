package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class SystemLog_Pharmacist {
    private int log_id, account_pharmacist_id;
    private String action, action_type, log_time;
}