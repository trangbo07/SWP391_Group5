package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class SystemLog_Staff {
    private int log_id, account_staff_id;
    private String action, action_type, log_time;
}
