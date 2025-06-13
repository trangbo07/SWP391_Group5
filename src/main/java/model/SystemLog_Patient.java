package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class SystemLog_Patient {
    private int log_id, account_patient_id;
    private String action, action_type, log_time;
}