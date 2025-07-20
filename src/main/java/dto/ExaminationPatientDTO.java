package dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ExaminationPatientDTO {
    // ExamResult
    private int examResultId;
    private String symptoms;
    private String preliminaryDiagnosis;
    private String examinationDate;

    // Doctor
    private int doctorId;
    private String doctorName;
    private String department;
    private String doctorPhone;
    private String eduLevel;

    // Patient
    private int patientId;
    private String patientName;
    private String dob;
    private String gender;
    private String patientPhone;
    private String address;
}