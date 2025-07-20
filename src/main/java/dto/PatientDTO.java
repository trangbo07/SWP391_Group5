package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private int patientId;  // Thay "id" bằng "patientId" để khớp với cột patient_id
    private String fullName;  // Thay "full_name" bằng "fullName" để khớp với chuẩn Java
    private String dob;
    private String gender;
    private String phone;
    private String address;
}
