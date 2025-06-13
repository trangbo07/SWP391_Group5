package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Appointment {
    private int appointment_id, doctor_id, patient_id, receptionist_id;
    private String appointment_datetime, shift, status, note;
}
