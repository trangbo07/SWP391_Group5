package model;

import lombok.*;
import java.sql.Timestamp;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Waitlist {
    // Existing fields
    private int waitlist_id, patient_id, doctor_id, room_id;
    private String registered_at, estimated_time, visittype, status;

    // New fields for receptionist view
    private String patientName;
    private String doctorName;
    private String roomName;
    private Timestamp registeredAtTimestamp;
    private Timestamp estimatedTimeTimestamp;

    // Getters and setters for new fields
    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public Timestamp getRegisteredAtTimestamp() {
        return registeredAtTimestamp;
    }

    public void setRegisteredAtTimestamp(Timestamp registeredAtTimestamp) {
        this.registeredAtTimestamp = registeredAtTimestamp;
        if (registeredAtTimestamp != null) {
            this.registered_at = registeredAtTimestamp.toString();
        }
    }

    public Timestamp getEstimatedTimeTimestamp() {
        return estimatedTimeTimestamp;
    }

    public void setEstimatedTimeTimestamp(Timestamp estimatedTimeTimestamp) {
        this.estimatedTimeTimestamp = estimatedTimeTimestamp;
        if (estimatedTimeTimestamp != null) {
            this.estimated_time = estimatedTimeTimestamp.toString();
        }
    }
}
