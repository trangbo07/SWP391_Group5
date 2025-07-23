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
    private String status;
} 