package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class DoctorSchedule {
    private int schedule_id, doctor_id, room_id;
    private String working_date, shift, note;
    private boolean is_available;
}
