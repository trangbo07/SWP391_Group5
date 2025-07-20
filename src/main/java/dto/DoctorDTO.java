package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private int doctorId;
    private String fullName;
    private String department;
    private String eduLevel;
    private String img;
    private String phone;
    private String email;
    private String role;

}