package dao;

import model.Invoice;
import java.util.List;

import java.sql.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import dto.PatientDiagnosisInvoiceDTO;
import dto.InvoiceCreationDTO;
import dto.InvoiceItemDTO;

public class InvoiceDAO {
    
    // Tạo hóa đơn mới
    public int createInvoice(InvoiceCreationDTO invoiceData) {
        String sql = "INSERT INTO Invoice (patient_id, medicineRecord_id, issue_date, total_amount, status, notes) VALUES (?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            
            ps.setInt(1, invoiceData.getPatientId());
            ps.setInt(2, invoiceData.getMedicineRecordId());
            ps.setString(3, currentDate);
            ps.setDouble(4, 0.0); // Set initial total_amount to 0.0
            ps.setString(5, "Pending"); // Trạng thái mặc định
            ps.setString(6, invoiceData.getNotes());
            
            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    int invoiceId = rs.getInt(1);
                    
                    // Tạo các item của hóa đơn
                    createInvoiceItems(invoiceId, invoiceData.getServices(), "Service");
                    createInvoiceItems(invoiceId, invoiceData.getMedications(), "Medication");
                    
                    return invoiceId;
                }
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return -1;
    }
    
    // Tạo các item của hóa đơn
    private void createInvoiceItems(int invoiceId, List<InvoiceItemDTO> items, String itemType) {
        if (items == null || items.isEmpty()) return;
        
        String sql = "INSERT INTO InvoiceItem (invoice_id, item_id, item_name, item_type, quantity, unit_price, total_price, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            for (InvoiceItemDTO item : items) {
                ps.setInt(1, invoiceId);
                ps.setInt(2, item.getItemId());
                ps.setString(3, item.getItemName());
                ps.setString(4, itemType);
                ps.setInt(5, item.getQuantity());
                ps.setDouble(6, item.getUnitPrice());
                ps.setDouble(7, item.getTotalPrice());
                ps.setString(8, item.getDescription());
                ps.addBatch();
            }
            
            ps.executeBatch();
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    // Lấy tất cả hóa đơn với chi tiết theo query SQL đã cung cấp
    public List<Map<String, Object>> getAllInvoicesWithDetails() {
        List<Map<String, Object>> invoices = new ArrayList<>();
        String sql = """
            SELECT 
                i.invoice_id,
                i.medicineRecord_id,
                i.patient_id,
                pt.full_name AS patient_name,
                pt.phone AS patient_phone,
                pt.address AS patient_address,
                pt.gender AS patient_gender,
                pt.dob AS patient_dob,
                i.issue_date,
                i.total_amount,
                i.status,
                ISNULL(SUM(DISTINCT si.total_price), 0) AS total_service_price,
                ISNULL(SUM(DISTINCT p.amount), 0) AS total_prescription_price,
                ISNULL(SUM(DISTINCT si.total_price), 0) + ISNULL(SUM(DISTINCT p.amount), 0) AS total_invoice
            FROM Invoice i
            LEFT JOIN Patient pt ON i.patient_id = pt.patient_id
            LEFT JOIN ServiceInvoice si ON i.invoice_id = si.invoice_id
            LEFT JOIN Payment p ON i.invoice_id = p.invoice_id AND p.payment_type = 'Prescription'
            GROUP BY 
                i.invoice_id,
                i.medicineRecord_id,
                i.patient_id,
                pt.full_name,
                pt.phone,
                pt.address,
                pt.gender,
                pt.dob,
                i.issue_date,
                i.total_amount,
                i.status
            ORDER BY i.issue_date DESC
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                Map<String, Object> invoice = new HashMap<>();
                invoice.put("invoice_id", rs.getInt("invoice_id"));
                invoice.put("medicineRecord_id", rs.getInt("medicineRecord_id"));
                invoice.put("patient_id", rs.getInt("patient_id"));
                invoice.put("patient_name", rs.getString("patient_name"));
                invoice.put("patient_phone", rs.getString("patient_phone"));
                invoice.put("patient_address", rs.getString("patient_address"));
                invoice.put("patient_gender", rs.getString("patient_gender"));
                invoice.put("patient_dob", rs.getString("patient_dob"));
                invoice.put("issue_date", rs.getString("issue_date"));
                invoice.put("total_amount", rs.getDouble("total_amount"));
                invoice.put("status", rs.getString("status"));
                invoice.put("total_service_price", rs.getDouble("total_service_price"));
                invoice.put("total_prescription_price", rs.getDouble("total_prescription_price"));
                invoice.put("total_invoice", rs.getDouble("total_invoice"));
                invoices.add(invoice);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return invoices;
    }

    // Lấy danh sách hóa đơn cho lễ tân (giữ lại method cũ)
    public List<Map<String, Object>> getPendingInvoicesForReceptionist() {
        List<Map<String, Object>> invoices = new ArrayList<>();
        String sql = """
            SELECT i.invoice_id, i.issue_date, i.total_amount, i.status, i.notes,
                   p.full_name as patient_name, p.phone as patient_phone,
                   d.full_name as doctor_name,
                   dia.disease, dia.conclusion
            FROM Invoice i
            JOIN Patient p ON i.patient_id = p.patient_id
            JOIN MedicineRecords mr ON i.medicineRecord_id = mr.medicineRecord_id
            JOIN Diagnosis dia ON dia.medicineRecord_id = mr.medicineRecord_id
            LEFT JOIN Doctor d ON mr.doctor_id = d.doctor_id
            WHERE i.status = 'Pending'
            ORDER BY i.issue_date DESC
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                Map<String, Object> invoice = new HashMap<>();
                invoice.put("invoice_id", rs.getInt("invoice_id"));
                invoice.put("issue_date", rs.getString("issue_date"));
                invoice.put("total_amount", rs.getDouble("total_amount"));
                invoice.put("status", rs.getString("status"));
                invoice.put("notes", rs.getString("notes"));
                invoice.put("patient_name", rs.getString("patient_name"));
                invoice.put("patient_phone", rs.getString("patient_phone"));
                invoice.put("doctor_name", rs.getString("doctor_name"));
                invoice.put("disease", rs.getString("disease"));
                invoice.put("conclusion", rs.getString("conclusion"));
                invoices.add(invoice);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return invoices;
    }
    
    // Lấy chi tiết hóa đơn với items
    public Map<String, Object> getInvoiceDetailsWithItems(int invoiceId) {
        Map<String, Object> invoiceDetails = new HashMap<>();
        
        // Lấy thông tin hóa đơn
        String sql = """
            SELECT i.invoice_id, i.issue_date, i.total_amount, i.status, i.notes,
                   p.full_name as patient_name, p.phone as patient_phone, p.address as patient_address,
                   d.full_name as doctor_name,
                   dia.disease, dia.conclusion, dia.treatment_plan
            FROM Invoice i
            JOIN Patient p ON i.patient_id = p.patient_id
            JOIN MedicineRecords mr ON i.medicineRecord_id = mr.medicineRecord_id
            JOIN Diagnosis dia ON dia.medicineRecord_id = mr.medicineRecord_id
            LEFT JOIN Doctor d ON mr.doctor_id = d.doctor_id
            WHERE i.invoice_id = ?
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, invoiceId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                invoiceDetails.put("invoice_id", rs.getInt("invoice_id"));
                invoiceDetails.put("issue_date", rs.getString("issue_date"));
                invoiceDetails.put("total_amount", rs.getDouble("total_amount"));
                invoiceDetails.put("status", rs.getString("status"));
                invoiceDetails.put("notes", rs.getString("notes"));
                invoiceDetails.put("patient_name", rs.getString("patient_name"));
                invoiceDetails.put("patient_phone", rs.getString("patient_phone"));
                invoiceDetails.put("patient_address", rs.getString("patient_address"));
                invoiceDetails.put("doctor_name", rs.getString("doctor_name"));
                invoiceDetails.put("disease", rs.getString("disease"));
                invoiceDetails.put("conclusion", rs.getString("conclusion"));
                invoiceDetails.put("treatment_plan", rs.getString("treatment_plan"));
                
                // Lấy danh sách items
                List<Map<String, Object>> items = getInvoiceItems(invoiceId);
                invoiceDetails.put("items", items);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return invoiceDetails;
    }
    
    // Lấy danh sách items của hóa đơn
    public List<Map<String, Object>> getInvoiceItems(int invoiceId) {
        List<Map<String, Object>> items = new ArrayList<>();
        String sql = "SELECT * FROM InvoiceItem WHERE invoice_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, invoiceId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("item_id", rs.getInt("item_id"));
                item.put("item_name", rs.getString("item_name"));
                item.put("item_type", rs.getString("item_type"));
                item.put("quantity", rs.getInt("quantity"));
                item.put("unit_price", rs.getDouble("unit_price"));
                item.put("total_price", rs.getDouble("total_price"));
                item.put("description", rs.getString("description"));
                items.add(item);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return items;
    }

    // Lấy danh sách hóa đơn của một bệnh nhân
    public List<Invoice> getInvoicesByPatientId(int patientId) {
        List<Invoice> invoices = new ArrayList<>();
        String sql = "SELECT * FROM Invoice WHERE patient_id = ? ORDER BY issue_date DESC";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, patientId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                Invoice invoice = new Invoice(
                    rs.getInt("invoice_id"),
                    rs.getInt("patient_id"),
                    rs.getInt("medicineRecord_id"),
                    rs.getString("issue_date"),
                    rs.getDouble("total_amount"),
                    rs.getString("status")
                );
                invoices.add(invoice);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return invoices;
    }
    
    // Lấy chi tiết hóa đơn theo mã hóa đơn
    public Invoice getInvoiceById(int invoiceId) {
        String sql = "SELECT * FROM Invoice WHERE invoice_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, invoiceId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return new Invoice(
                    rs.getInt("invoice_id"),
                    rs.getInt("patient_id"),
                    rs.getInt("medicineRecord_id"),
                    rs.getString("issue_date"),
                    rs.getDouble("total_amount"),
                    rs.getString("status")
                );
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return null;
    }

    public List<PatientDiagnosisInvoiceDTO> getDiagnosisInvoicesByPatientId(int patientId) {
        List<PatientDiagnosisInvoiceDTO> list = new ArrayList<>();
        String sql = "SELECT p.full_name, p.dob, p.gender, d.disease, d.conclusion, d.treatment_plan, i.invoice_id, i.total_amount, i.status " +
                     "FROM Diagnosis d " +
                     "JOIN MedicineRecords m ON d.medicineRecord_id = m.medicineRecord_id " +
                     "JOIN Patient p ON p.patient_id = m.patient_id " +
                     "JOIN Invoice i ON i.medicineRecord_id = m.medicineRecord_id " +
                     "WHERE m.patient_id = ?";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, patientId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PatientDiagnosisInvoiceDTO dto = new PatientDiagnosisInvoiceDTO(
                        rs.getInt("invoice_id"),
                        rs.getString("full_name"),
                        rs.getString("dob"),
                        rs.getString("gender"),
                        rs.getString("disease"),
                        rs.getString("conclusion"),
                        rs.getString("treatment_plan"),
                        rs.getDouble("total_amount"),
                        rs.getString("status")
                    );
                    list.add(dto);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean updateInvoiceStatus(int invoiceId, String status) {
        System.out.println("[DAO] Updating invoiceId=" + invoiceId + " to status=" + status);
        String sql = "UPDATE Invoice SET status = ? WHERE invoice_id = ?";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, invoiceId);
            int rows = ps.executeUpdate();
            System.out.println("[DAO] Rows updated: " + rows);
            return rows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    public int createInitialInvoice(int patientId, int medicineRecordId, String status) {
        String sql = "INSERT INTO Invoice (patient_id, medicineRecord_id, issue_date, status) VALUES (?, ?, ?, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            ps.setInt(1, patientId);
            ps.setInt(2, medicineRecordId);
            ps.setString(3, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            ps.setString(4, status);
            
            int rowsAffected = ps.executeUpdate();
            if (rowsAffected > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error creating initial invoice: " + e.getMessage());
            e.printStackTrace();
        }
        
        return -1;
    }

    // Thêm các dịch vụ vào ServiceInvoice
    public boolean addServiceInvoices(int invoiceId, List<Map<String, Object>> services) {
        String sql = "INSERT INTO ServiceInvoice (invoice_id, service_order_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            for (Map<String, Object> service : services) {
                ps.setInt(1, invoiceId);
                ps.setInt(2, ((Number)service.get("service_order_item_id")).intValue());
                ps.setInt(3, ((Number)service.get("quantity")).intValue());
                ps.setDouble(4, ((Number)service.get("unit_price")).doubleValue());
                ps.addBatch();
            }
            
            int[] results = ps.executeBatch();
            return results.length == services.size();
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Thêm đơn thuốc và thuốc
    public boolean addPrescriptionInvoice(int invoiceId, int prescriptionId, int pharmacistId) {
        String sql = "INSERT INTO PrescriptionInvoice (invoice_id, prescription_id, pharmacist_id) VALUES (?, ?, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection()) {
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, invoiceId);
                ps.setInt(2, prescriptionId);
                ps.setInt(3, pharmacistId);
                
                int rowsAffected = ps.executeUpdate();
                return rowsAffected > 0;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Cập nhật tổng tiền và thông tin khác của invoice
    public boolean updateInvoiceTotal(int invoiceId, double totalAmount, String notes) {
        String sql = "UPDATE Invoice SET total_amount = ?, notes = ? WHERE invoice_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setDouble(1, totalAmount); // Use setDouble for DECIMAL column
            ps.setString(2, notes);
            ps.setInt(3, invoiceId);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public int createPrescription(int medicineRecordId, int doctorId) {
        String sql = "INSERT INTO Prescription (medicineRecord_id, doctor_id, status) VALUES (?, ?, 'Pending')";
        
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
} 