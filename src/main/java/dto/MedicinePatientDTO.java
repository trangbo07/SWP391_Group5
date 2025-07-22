package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicinePatientDTO {
    private int medicineRecordId;
    private int patientId;
    private String fullName;
    private String gender;
    private String phone;
    private String address;
}
