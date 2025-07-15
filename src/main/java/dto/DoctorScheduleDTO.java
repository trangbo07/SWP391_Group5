package dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleDTO {
    private int doctorId;
    private String workingDate;
    private String shift;
}