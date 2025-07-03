package dto;

import java.util.List;

public class InvoiceCreationDTO {
    private int patientId;
    private int medicineRecordId;
    private int doctorId;
    private String patientName;
    private String diagnosis;
    private String treatmentPlan;
    private List<InvoiceItemDTO> services;
    private List<InvoiceItemDTO> medications;
    private double totalAmount;
    private String notes;

    public InvoiceCreationDTO() {}

    public InvoiceCreationDTO(int patientId, int medicineRecordId, int doctorId, 
                             String patientName, String diagnosis, String treatmentPlan,
                             List<InvoiceItemDTO> services, List<InvoiceItemDTO> medications,
                             double totalAmount, String notes) {
        this.patientId = patientId;
        this.medicineRecordId = medicineRecordId;
        this.doctorId = doctorId;
        this.patientName = patientName;
        this.diagnosis = diagnosis;
        this.treatmentPlan = treatmentPlan;
        this.services = services;
        this.medications = medications;
        this.totalAmount = totalAmount;
        this.notes = notes;
    }

    // Getters and Setters
    public int getPatientId() { return patientId; }
    public void setPatientId(int patientId) { this.patientId = patientId; }

    public int getMedicineRecordId() { return medicineRecordId; }
    public void setMedicineRecordId(int medicineRecordId) { this.medicineRecordId = medicineRecordId; }

    public int getDoctorId() { return doctorId; }
    public void setDoctorId(int doctorId) { this.doctorId = doctorId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getTreatmentPlan() { return treatmentPlan; }
    public void setTreatmentPlan(String treatmentPlan) { this.treatmentPlan = treatmentPlan; }

    public List<InvoiceItemDTO> getServices() { return services; }
    public void setServices(List<InvoiceItemDTO> services) { this.services = services; }

    public List<InvoiceItemDTO> getMedications() { return medications; }
    public void setMedications(List<InvoiceItemDTO> medications) { this.medications = medications; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
} 