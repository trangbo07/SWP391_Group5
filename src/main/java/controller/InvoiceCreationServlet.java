package controller;

import dao.InvoiceDAO;
import dao.PatientDAO;
import dao.ListOfMedicalServiceDAO;
import dao.MedicineDAO;
import dao.DiagnosisDAO;
import dao.AccountStaffDAO;
import dao.PrescriptionDAO;
import dto.InvoiceCreationDTO;
import dto.InvoiceItemDTO;
import model.AccountStaff;
import model.Doctor;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.lang.reflect.Type;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import java.sql.SQLException;

@WebServlet("/invoice-creation")
public class InvoiceCreationServlet extends HttpServlet {
    private InvoiceDAO invoiceDAO = new InvoiceDAO();
    private PatientDAO patientDAO = new PatientDAO();
    private ListOfMedicalServiceDAO serviceDAO = new ListOfMedicalServiceDAO();
    private MedicineDAO medicineDAO = new MedicineDAO();
    private DiagnosisDAO diagnosisDAO = new DiagnosisDAO();
    private AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
    private final PrescriptionDAO prescriptionDAO = new PrescriptionDAO();
    private final Gson gson = new GsonBuilder().create();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String action = req.getParameter("action");
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        
        try {
            if ("getServices".equals(action)) {
                // Lấy danh sách dịch vụ y tế
                List<Map<String, Object>> services = serviceDAO.getAllServicesAsMap();
                out.print(gson.toJson(services));
                
            } else if ("getMedicines".equals(action)) {
                // Lấy danh sách thuốc
                List<Map<String, Object>> medicines = medicineDAO.getAllMedicines();
                out.print(gson.toJson(medicines));
                
            } else if ("getPatientInfo".equals(action)) {
                // Lấy thông tin bệnh nhân
                int patientId = Integer.parseInt(req.getParameter("patientId"));
                Map<String, Object> patientInfo = patientDAO.getPatientInfoWithDiagnosis(patientId);
                out.print(gson.toJson(patientInfo));
                
            } else {
                out.print("{\"error\":\"Invalid action\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String action = req.getParameter("action");
        if (action == null) {
            sendError(resp, "Missing action parameter");
            return;
        }

        try {
            switch (action) {
                case "updateDiagnosis":
                    handleUpdateDiagnosis(req, resp);
                    break;
                case "createInitial":
                    handleCreateInitial(req, resp);
                    break;
                case "addServices":
                    handleAddServices(req, resp);
                    break;
                case "addPrescription":
                    addPrescription(req, resp);
                    break;
                case "updateTotal":
                    handleUpdateTotal(req, resp);
                    break;
                default:
                    sendError(resp, "Invalid action: " + action);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendError(resp, "Server error: " + e.getMessage());
        }
    }

    private void handleUpdateDiagnosis(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        // Get and validate parameters
        String medicineRecordIdStr = req.getParameter("medicineRecordId");
        String conclusion = req.getParameter("conclusion");
        String treatmentPlan = req.getParameter("treatmentPlan");
        String disease = req.getParameter("disease");

        // Validate required parameters
        if (medicineRecordIdStr == null || medicineRecordIdStr.trim().isEmpty()) {
            sendError(resp, "medicineRecordId is required");
            return;
        }

        // Get doctor from session
        HttpSession session = req.getSession();
        Object userObj = session.getAttribute("user");
        
        if (userObj == null || !(userObj instanceof AccountStaff)) {
            sendError(resp, "Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.");
            return;
        }

        AccountStaff accountStaff = (AccountStaff) userObj;
        if (!"Doctor".equals(accountStaff.getRole())) {
            sendError(resp, "Chỉ bác sĩ mới có thể tạo chẩn đoán.");
            return;
        }

        try {
            int medicineRecordId = Integer.parseInt(medicineRecordIdStr);
            
            // Get doctor_id from AccountStaff
            Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
            if (doctor == null) {
                sendError(resp, "Không tìm thấy thông tin bác sĩ trong hệ thống.");
                return;
            }

            boolean success = diagnosisDAO.createNewDiagnosis(medicineRecordId, doctor.getDoctor_id(), conclusion, disease, treatmentPlan);
            
            if (success) {
                sendError(resp, true, null);
            } else {
                sendError(resp, "Không thể tạo chẩn đoán mới");
            }
        } catch (NumberFormatException e) {
            sendError(resp, "Invalid medicineRecordId format");
        } catch (SQLException e) {
            // Log the full stack trace for debugging
            e.printStackTrace();
            // Send a user-friendly message
            String errorMessage = e.getMessage();
            if (errorMessage.contains("foreign key")) {
                sendError(resp, "Không tìm thấy thông tin bệnh án hoặc bác sĩ tương ứng");
            } else {
                sendError(resp, "Lỗi khi tạo chẩn đoán: " + errorMessage);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendError(resp, "Lỗi hệ thống, vui lòng thử lại sau");
        }
    }

    private void handleCreateInitial(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        try {
            int patientId = Integer.parseInt(req.getParameter("patientId"));
            int medicineRecordId = Integer.parseInt(req.getParameter("medicineRecordId"));
            String status = req.getParameter("status");

            // Validate input
            if (patientId <= 0 || medicineRecordId <= 0) {
                sendError(resp, "Invalid patientId or medicineRecordId");
                return;
            }

            // Tạo invoice trống với status = Pending
            int invoiceId = invoiceDAO.createInitialInvoice(patientId, medicineRecordId, status);
            
            if (invoiceId > 0) {
                Map<String, Object> data = new HashMap<>();
                data.put("invoiceId", invoiceId);
                sendError(resp, true, null, data);
            } else {
                sendError(resp, "Không thể tạo hóa đơn ban đầu");
            }
        } catch (NumberFormatException e) {
            sendError(resp, "Invalid number format in parameters");
        } catch (Exception e) {
            System.err.println("Error creating initial invoice: " + e.getMessage());
            e.printStackTrace();
            sendError(resp, "Lỗi khi tạo hóa đơn: " + e.getMessage());
        }
    }

    private void handleAddServices(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        int invoiceId = Integer.parseInt(req.getParameter("invoiceId"));
        String servicesJson = req.getParameter("services");
        
        List<Map<String, Object>> services = gson.fromJson(servicesJson, 
            new TypeToken<List<Map<String, Object>>>(){}.getType());
            
        boolean success = invoiceDAO.addServiceInvoices(invoiceId, services);
        
        sendError(resp, success, success ? null : "Không thể thêm dịch vụ");
    }

    private void addPrescription(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int invoiceId = Integer.parseInt(req.getParameter("invoiceId"));
        int medicineRecordId = Integer.parseInt(req.getParameter("medicineRecordId"));
        int doctorId = Integer.parseInt(req.getParameter("doctorId"));
        String medicationsJson = req.getParameter("medications");
        
        Type medicationType = new TypeToken<List<Map<String, Object>>>(){}.getType();
        List<Map<String, Object>> medications = gson.fromJson(medicationsJson, medicationType);

        try {
            // Create prescription
            int prescriptionId = prescriptionDAO.createPrescription(medicineRecordId, doctorId);
            
            // Create prescription invoice link
            boolean prescriptionInvoiceCreated = prescriptionDAO.createPrescriptionInvoice(invoiceId, prescriptionId);
            
            if (!prescriptionInvoiceCreated) {
                throw new Exception("Failed to create prescription invoice");
            }
            
            // Add medicines to prescription
            boolean medicinesAdded = prescriptionDAO.addMedicinesForPrescription(prescriptionId, medications);
            
            if (!medicinesAdded) {
                throw new Exception("Failed to add medicines to prescription");
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã tạo đơn thuốc thành công");
            result.put("data", prescriptionId);
            
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(gson.toJson(result));
            
        } catch (Exception e) {
            e.printStackTrace();
            sendError(resp, "Không thể tạo đơn thuốc: " + e.getMessage());
        }
    }

    private void handleUpdateTotal(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        int invoiceId = Integer.parseInt(req.getParameter("invoiceId"));
        double totalAmount = Double.parseDouble(req.getParameter("totalAmount"));
        String notes = req.getParameter("notes");
        
        boolean success = invoiceDAO.updateInvoiceTotal(invoiceId, totalAmount, notes);
        
        sendError(resp, success, success ? null : "Không thể cập nhật tổng tiền");
    }

    private void sendError(HttpServletResponse resp, String message) throws IOException {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", message);
        
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(gson.toJson(result));
    }

    private void sendError(HttpServletResponse resp, boolean success, String message) throws IOException {
        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        if (message != null) {
            result.put("message", message);
        }
        
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(gson.toJson(result));
    }

    private void sendError(HttpServletResponse resp, boolean success, String message, Map<String, Object> data) throws IOException {
        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        if (message != null) {
            result.put("message", message);
        }
        if (data != null) {
            result.putAll(data);
        }
        
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(gson.toJson(result));
    }
} 