package dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleDepartDTO {
    private int doctorId;
    private String fullName;
    private String img;
    private String phone;
    private String department;
    private String eduLevel;
}
