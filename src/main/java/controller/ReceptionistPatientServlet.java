package controller;

import com.google.gson.Gson;
import dao.PatientDAO;
import model.Patient;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.stream.Collectors;

@WebServlet("/api/receptionist/patient")
public class ReceptionistPatientServlet extends HttpServlet {
    private final PatientDAO patientDAO = new PatientDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        try {
            String body = req.getReader().lines().collect(Collectors.joining());
            PatientRequest patientRequest = gson.fromJson(body, PatientRequest.class);
            Patient patient = new Patient();
            patient.setFull_name(patientRequest.full_name);
            patient.setDob(patientRequest.dob);
            patient.setGender(patientRequest.gender);
            patient.setPhone(patientRequest.phone);
            patient.setAddress(patientRequest.address);
            int patientId = patientDAO.createPatient(patient);
            if (patientId > 0) {
                out.write("{\"success\":true,\"patient_id\":" + patientId + "}");
            } else {
                resp.setStatus(500);
                out.write("{\"success\":false,\"message\":\"Failed to create patient\"}");
            }
        } catch (Exception e) {
            resp.setStatus(500);
            out.write("{\"success\":false,\"message\":\"Internal server error\"}");
        }
    }

    private static class PatientRequest {
        String full_name;
        String dob;
        String gender;
        String phone;
        String address;
    }
} 