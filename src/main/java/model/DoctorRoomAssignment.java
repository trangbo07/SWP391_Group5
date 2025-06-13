package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class DoctorRoomAssignment {
    private int assignment_id, doctor_id, room_id;
    private String assignment_date, shift;
}
