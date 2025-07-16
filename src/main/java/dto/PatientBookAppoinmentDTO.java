package dto;

import lombok.*;

import java.sql.Timestamp; // ✅ đúng import

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PatientBookAppoinmentDTO {
    private int appointmentId;
    private int doctorId;
    private int patientId;
    private Timestamp appointmentDatetime;
    private int receptionistId;
    private String shift;
    private String note;
    private String status;

}