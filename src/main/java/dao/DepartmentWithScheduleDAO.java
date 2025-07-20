package dao;

import dto.DoctorDTO;
import dto.DoctorScheduleDTO;
import dto.DoctorScheduleDepartDTO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class DepartmentWithScheduleDAO {
    public List<DoctorScheduleDepartDTO> getDoctorsByDepartment(String department) {
        DBContext db = DBContext.getInstance();
        List<DoctorScheduleDepartDTO> list = new ArrayList<>();

        String sql = "SELECT DISTINCT d.doctor_id, d.full_name, a.img, d.phone, d.department, d.eduLevel " +
                "FROM Doctor d " +
                "JOIN DoctorSchedule s ON d.doctor_id = s.doctor_id " +
                "JOIN AccountStaff a ON d.account_staff_id = a.account_staff_id " +
                "WHERE a.status = 'Enable' AND d.department = ?";

        try (Connection con = db.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, department);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                DoctorScheduleDepartDTO doctor = new DoctorScheduleDepartDTO();
                doctor.setDoctorId(rs.getInt("doctor_id"));
                doctor.setFullName(rs.getString("full_name"));
                doctor.setImg(rs.getString("img"));
                doctor.setPhone(rs.getString("phone"));
                doctor.setDepartment(rs.getString("department"));
                doctor.setEduLevel(rs.getString("eduLevel"));

                list.add(doctor);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
}
