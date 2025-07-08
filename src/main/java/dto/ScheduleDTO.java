package dto;

public class ScheduleDTO {
    private int doctorId;
    private String workingDate;
    private String shift;
    private int roomId;
    private String note;

    public String getWorkingDate() {
        return workingDate;
    }

    public void setWorkingDate(String workingDate) {
        this.workingDate = workingDate;
    }

    public int getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(int doctorId) {
        this.doctorId = doctorId;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public int getRoomId() {
        return roomId;
    }

    public void setRoomId(int roomId) {
        this.roomId = roomId;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
