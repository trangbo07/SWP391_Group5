package dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ExaminationPatientDTO {
    private int examResultId;
    private String doctorName;
    private String symptoms;
    private String preliminaryDiagnosis;
    private String examinationDate;
}
