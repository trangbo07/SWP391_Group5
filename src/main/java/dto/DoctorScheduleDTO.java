package dto;

import lombok.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleDTO {
    private int scheduleId;
    private int doctorId;
    private String workingDate;
    private String shift;
    private int roomId;
    private int isAvailable;
    private String note;
    private int adminId;
}