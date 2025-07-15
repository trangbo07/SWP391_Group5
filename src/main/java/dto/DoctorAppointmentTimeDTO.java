package dto;

import java.sql.Timestamp;

public class DoctorAppointmentTimeDTO {
    private Timestamp appointmentDatetime;

    public DoctorAppointmentTimeDTO() {}

    public DoctorAppointmentTimeDTO(Timestamp appointmentDatetime) {
        this.appointmentDatetime = appointmentDatetime;
    }

    public Timestamp getAppointmentDatetime() {
        return appointmentDatetime;
    }

    public void setAppointmentDatetime(Timestamp appointmentDatetime) {
        this.appointmentDatetime = appointmentDatetime;
    }
} 