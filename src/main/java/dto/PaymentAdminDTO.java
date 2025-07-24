package dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class PaymentAdminDTO {
    private String full_name;
    private String dob;
    private String gender;
    private String disease;
    private String conclusion;
    private String treatment_plan;
    private double total_amount;
    private double serviceAmount;
    private double medicineAmount;
    private double totalAmount;
    private String status;

    public PaymentAdminDTO(String full_name, String dob, String gender, String disease, String conclusion, String treatment_plan, double serviceAmount, double medicineAmount, double totalAmount, String status) {
        this.full_name = full_name;
        this.dob = dob;
        this.gender = gender;
        this.disease = disease;
        this.conclusion = conclusion;
        this.treatment_plan = treatment_plan;
        this.serviceAmount = serviceAmount;
        this.medicineAmount = medicineAmount;
        this.totalAmount = totalAmount;
        this.status = status;
    }
} 