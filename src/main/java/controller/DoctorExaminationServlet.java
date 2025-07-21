package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.AccountStaffDAO;
import dao.AppointmentDAO;
import dao.ExamResultDAO;
import dao.MedicineRecordDAO;
import dto.AppointmentDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountStaff;
import model.Doctor;
import model.ExamResult;
import model.MedicineRecords;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/doctor/examination")
public class DoctorExaminationServlet extends HttpServlet {
    
    private final ExamResultDAO examResultDAO = new ExamResultDAO();
    private final MedicineRecordDAO medicineRecordDAO = new MedicineRecordDAO();
    private final AppointmentDAO appointmentDAO = new AppointmentDAO();
    private final AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> jsonResponse = new HashMap<>();

        try {
            // Kiểm tra session và quyền bác sĩ
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Unauthorized access");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            AccountStaff accountStaff = (AccountStaff) session.getAttribute("user");
            if (!"Doctor".equals(accountStaff.getRole())) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Access denied. Doctor role required.");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Đọc dữ liệu từ request
            Map<String, Object> requestData = mapper.readValue(request.getReader(), Map.class);

            // Lấy thông tin từ request
            Integer patientId = (Integer) requestData.get("patientId");
            Integer waitlistId = (Integer) requestData.get("waitlistId");
            String symptoms = (String) requestData.get("symptomsDescription");
            String preliminaryDiagnosis = (String) requestData.get("preliminaryDiagnosis");

            // Validation
            if (patientId == null || waitlistId == null || symptoms == null || preliminaryDiagnosis == null) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Missing required fields");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            if (symptoms.trim().isEmpty() || preliminaryDiagnosis.trim().isEmpty()) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Symptoms and preliminary diagnosis cannot be empty");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Tạo medicine record mới cho mỗi lần khám (kể cả khám lại)
            int medicineRecordId = medicineRecordDAO.createMedicineRecord(patientId);
            if (medicineRecordId == -1) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Failed to create medicine record");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Lấy doctor_id từ session
            Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
            if (doctor == null) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Failed to get doctor information");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            int doctorId = doctor.getDoctor_id();

            // Tạo exam result
            ExamResult examResult = new ExamResult();
            examResult.setMedicineRecord_id(medicineRecordId);
            examResult.setSymptoms(symptoms);
            examResult.setPreliminary_diagnosis(preliminaryDiagnosis);
            examResult.setDoctor_id(doctorId);

            // Lưu vào database
            boolean success = examResultDAO.createExamResult(examResult);

            if (success) {
                jsonResponse.put("success", true);
                jsonResponse.put("message", "Examination result saved successfully");
                jsonResponse.put("examResultId", examResult.getExam_result_id());
                jsonResponse.put("medicineRecordId", medicineRecordId);
            } else {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Failed to save examination result");
            }

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Internal server error: " + e.getMessage());
        }

        mapper.writeValue(response.getWriter(), jsonResponse);
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, Object> jsonResponse = new HashMap<>();
        
        try {
            // Kiểm tra session
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Unauthorized access");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }
            
            String action = request.getParameter("action");
            
            if ("getByMedicineRecord".equals(action)) {
                String medicineRecordIdStr = request.getParameter("medicineRecordId");
                if (medicineRecordIdStr != null) {
                    int medicineRecordId = Integer.parseInt(medicineRecordIdStr);
                    var examResults = examResultDAO.getExamResultsByMedicineRecordId(medicineRecordId);
                    jsonResponse.put("success", true);
                    jsonResponse.put("data", examResults);
                } else {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Missing medicineRecordId parameter");
                }
            } else {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Invalid action");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Internal server error: " + e.getMessage());
        }
        
        mapper.writeValue(response.getWriter(), jsonResponse);
    }
} 