package dao;

import model.Prescription;
import java.sql.*;
import java.util.*;

public class PrescriptionDAO {
    public List<Prescription> getPrescriptionsByPatientId(int patientId) {
        List<Prescription> list = new ArrayList<>();
        String sql = "SELECT p.* FROM Prescription p JOIN MedicineRecords m ON p.medicineRecord_id = m.medicineRecord_id WHERE m.patient_id = ?";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Prescription p = new Prescription();
                p.setPrescription_id(rs.getInt("prescription_id"));
                p.setMedicineRecord_id(rs.getInt("medicineRecord_id"));
                p.setDoctor_id(rs.getInt("doctor_id"));
                p.setPrescription_date(rs.getString("prescription_date"));
                p.setStatus(rs.getString("status"));
                list.add(p);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Map<String, Object>> getPrescriptionsByPatientIdWithDoctorName(int patientId) {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT p.*, d.full_name as doctor_name FROM Prescription p JOIN MedicineRecords m ON p.medicineRecord_id = m.medicineRecord_id JOIN Doctor " +
                "d ON p.doctor_id = d.doctor_id WHERE m.patient_id = ?";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("prescription_id", rs.getInt("prescription_id"));
                map.put("medicineRecord_id", rs.getInt("medicineRecord_id"));
                map.put("doctor_id", rs.getInt("doctor_id"));
                map.put("doctor_name", rs.getString("doctor_name"));
                map.put("prescription_date", rs.getString("prescription_date"));
                map.put("status", rs.getString("status"));
                list.add(map);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Map<String, Object>> getPrescriptionDetailsByPatientId(int patientId) {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT p.prescription_id, p.medicineRecord_id, p.doctor_id, p.prescription_date, p.status, " +
                "pd.prescription_detail_id, m.medicine_id, m.name AS medicine_name, " +
                "pd.quantity AS prescribed_quantity, pd.dosage, pd.note " +
                "FROM Prescription p " +
                "JOIN MedicineRecords mr ON p.medicineRecord_id = mr.medicineRecord_id " +
                "JOIN PrescriptionDetail pd ON p.prescription_id = pd.prescription_id " +
                "JOIN Medicine m ON pd.medicine_id = m.medicine_id " +
                "WHERE mr.patient_id = ? " +
                "ORDER BY p.prescription_id, pd.prescription_detail_id";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("prescription_id", rs.getInt("prescription_id"));
                map.put("medicineRecord_id", rs.getInt("medicineRecord_id"));
                map.put("doctor_id", rs.getInt("doctor_id"));
                map.put("prescription_date", rs.getString("prescription_date"));
                map.put("status", rs.getString("status"));
                map.put("prescription_detail_id", rs.getInt("prescription_detail_id"));
                map.put("medicine_id", rs.getInt("medicine_id"));
                map.put("medicine_name", rs.getString("medicine_name"));
                map.put("prescribed_quantity", rs.getInt("prescribed_quantity"));
                map.put("dosage", rs.getString("dosage"));
                map.put("note", rs.getString("note"));
                list.add(map);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public int createPrescription(int medicineRecordId, int doctorId) {
        String sql = "INSERT INTO Prescription (medicineRecord_id, doctor_id, prescription_date, status) VALUES (?, ?, GETDATE(), 'Pending')";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            ps.setInt(1, medicineRecordId);
            ps.setInt(2, doctorId);
            
            int rowsAffected = ps.executeUpdate();
            if (rowsAffected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1); 
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return -1;
    }

    public boolean createPrescriptionInvoice(int invoiceId, int prescriptionId) {
        String sql = "INSERT INTO PrescriptionInvoice (invoice_id, pharmacist_id, prescription_id) VALUES (?, 1, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, invoiceId);
            ps.setInt(2, prescriptionId);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public int getPrescriptionInvoiceId(int prescriptionId) {
        String sql = "SELECT prescription_invoice_id FROM PrescriptionInvoice WHERE prescription_id = ?";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, prescriptionId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("prescription_invoice_id");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return -1;
    }

    public boolean addMedicinesForPrescription(int prescriptionId, List<Map<String, Object>> medicines) {
        // First get the prescription_invoice_id
        int prescriptionInvoiceId = getPrescriptionInvoiceId(prescriptionId);
        if (prescriptionInvoiceId == -1) {
            return false;
        }
        
        return addMedicines(prescriptionInvoiceId, medicines);
    }

    private boolean addMedicines(int prescriptionInvoiceId, List<Map<String, Object>> medicines) {
        String sql = "INSERT INTO Medicines (prescription_invoice_id, medicine_id, quantity, dosage) VALUES (?, ?, ?, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            for (Map<String, Object> medicine : medicines) {
                ps.setInt(1, prescriptionInvoiceId);
                ps.setInt(2, ((Number)medicine.get("medicine_id")).intValue());
                ps.setInt(3, ((Number)medicine.get("quantity")).intValue());
                ps.setString(4, (String)medicine.get("dosage"));
                ps.addBatch();
            }
            
            int[] results = ps.executeBatch();
            return results.length == medicines.size();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
} 