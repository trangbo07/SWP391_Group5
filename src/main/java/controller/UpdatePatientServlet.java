package controller;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;
import dao.PatientDAO;
import model.Patient; // Import Patient class (adjust package if needed)
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/update-patient/*")
public class UpdatePatientServlet extends HttpServlet {
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");

        // Lấy patientId từ path
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.length() <= 1) {
            resp.sendError(400, "Missing patientId in URL");
            return;
        }
        int patientId;
        try {
            patientId = Integer.parseInt(pathInfo.substring(1));
        } catch (NumberFormatException e) {
            resp.sendError(400, "Invalid patientId");
            return;
        }

        // Đọc body JSON
        BufferedReader reader = req.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);

        Gson gson = new Gson();
        PatientUpdateRequest updateRequest;
        try {
            updateRequest = gson.fromJson(sb.toString(), PatientUpdateRequest.class);
        } catch (Exception e) {
            resp.sendError(400, "Invalid JSON body");
            return;
        }

        // Tạo Patient object từ data
        Patient patient = new Patient();
        patient.setPatient_id(patientId);
        patient.setFull_name(updateRequest.fullName);
        patient.setDob(updateRequest.dob);
        patient.setGender(updateRequest.gender);
        patient.setPhone(updateRequest.phone);
        patient.setAddress(updateRequest.address);

        // Gọi DAO với Patient object
        PatientDAO dao = new PatientDAO();
        boolean updated = dao.updatePatient(patient);

        resp.getWriter().write("{\"success\":" + updated + "}");
    }

    private static class PatientUpdateRequest {
        @SerializedName("full_name")
        String fullName;
        String dob;
        String gender;
        String phone;
        String address;
    }
}