package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PendingFeedbackDTO {
    private int patientId;
    private int doctorId;
    private String doctorName;
    private String patientName;
    private int appointmentId;
    private Timestamp appointmentDatetime;
}
