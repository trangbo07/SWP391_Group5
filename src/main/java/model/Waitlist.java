package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Waitlist {
    private int waitlist_id, patient_id, doctor_id, room_id;
    private String registered_at, estimated_time, visittype, status;
}
