package dto;

public class PatientDiagnosisInvoiceDTO {
    private int invoiceId;
    private String patientName;
    private String dob;
    private String gender;
    private String disease;
    private String conclusion;
    private String treatmentPlan;
    private double totalAmount;
    private String status;
    private double serviceAmount;
    private double medicineAmount;

    public PatientDiagnosisInvoiceDTO(int invoiceId, String patientName, String dob, String gender, String disease, String conclusion, String treatmentPlan, double serviceAmount, double medicineAmount, double totalAmount, String status) {
        this.invoiceId = invoiceId;
        this.patientName = patientName;
        this.dob = dob;
        this.gender = gender;
        this.disease = disease;
        this.conclusion = conclusion;
        this.treatmentPlan = treatmentPlan;
        this.serviceAmount = serviceAmount;
        this.medicineAmount = medicineAmount;
        this.totalAmount = totalAmount;
        this.status = status;
    }
    
    public int getInvoiceId() { return invoiceId; }
    public void setInvoiceId(int invoiceId) { this.invoiceId = invoiceId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getDisease() { return disease; }
    public void setDisease(String disease) { this.disease = disease; }
    public String getConclusion() { return conclusion; }
    public void setConclusion(String conclusion) { this.conclusion = conclusion; }
    public String getTreatmentPlan() { return treatmentPlan; }
    public void setTreatmentPlan(String treatmentPlan) { this.treatmentPlan = treatmentPlan; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getServiceAmount() { return serviceAmount; }
    public void setServiceAmount(double serviceAmount) { this.serviceAmount = serviceAmount; }
    public double getMedicineAmount() { return medicineAmount; }
    public void setMedicineAmount(double medicineAmount) { this.medicineAmount = medicineAmount; }
} 