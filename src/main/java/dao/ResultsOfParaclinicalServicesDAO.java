package dao;

import model.ResultsOfParaclinicalServices;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ResultsOfParaclinicalServicesDAO {
    
    // Lấy kết quả xét nghiệm theo service order item ID
    public ResultsOfParaclinicalServices getResultByServiceOrderItemId(int serviceOrderItemId) {
        String sql = "SELECT * FROM ResultsOfParaclinicalServices WHERE service_order_item_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, serviceOrderItemId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return new ResultsOfParaclinicalServices(
                    rs.getInt("result_id"),
                    rs.getInt("service_order_item_id"),
                    rs.getString("result_description"),
                    rs.getString("created_at")
                );
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    // Lấy tất cả kết quả theo service order ID
    public List<Map<String, Object>> getResultsByServiceOrderId(int serviceOrderId) {
        List<Map<String, Object>> results = new ArrayList<>();
        String sql = """
          
   SELECT 
                so.service_order_id,
                so.order_date,
                so.medicineRecord_id,
                soi.service_order_item_id,
                lms.service_id,
                lms.name as service_name,
                lms.description as service_desc,
                lms.price as service_price,
                r.result_id,
                r.result_description,
                r.created_at as result_date,
                d.full_name as doctor_name,
                p.patient_id,
                p.full_name as patient_name,
                p.dob as patient_dob,
                p.gender as patient_gender,
                p.phone as patient_phone,
                p.address as patient_address
            FROM ServiceOrder so
            JOIN ServiceOrderItem soi ON so.service_order_id = soi.service_order_id
            JOIN ListOfMedicalService lms ON soi.service_id = lms.service_id
            LEFT JOIN MedicineRecords mr ON so.medicineRecord_id = mr.medicineRecord_id
            LEFT JOIN Patient p ON mr.patient_id = p.patient_id
            LEFT JOIN ResultsOfParaclinicalServices r ON soi.service_order_item_id = r.service_order_item_id
            LEFT JOIN Doctor d ON soi.doctor_id = d.doctor_id
            WHERE so.service_order_id = ?
            ORDER BY lms.name ASC
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, serviceOrderId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> result = new HashMap<>();
                result.put("service_order_id", rs.getInt("service_order_id"));
                result.put("order_date", rs.getString("order_date"));
                result.put("medicineRecord_id", rs.getInt("medicineRecord_id"));
                result.put("service_order_item_id", rs.getInt("service_order_item_id"));
                result.put("service_id", rs.getInt("service_id"));
                result.put("service_name", rs.getString("service_name"));
                result.put("service_description", rs.getString("service_desc"));
                result.put("service_price", rs.getDouble("service_price"));
                result.put("result_id", rs.getObject("result_id"));
                result.put("result_description", rs.getString("result_description"));
                result.put("result_date", rs.getString("result_date"));
                result.put("doctor_name", rs.getString("doctor_name"));
                result.put("is_completed", rs.getString("result_description") != null);
                
                // Thông tin bệnh nhân
                result.put("patient_id", rs.getInt("patient_id"));
                result.put("patient_name", rs.getString("patient_name"));
                result.put("patient_dob", rs.getString("patient_dob"));
                result.put("patient_gender", rs.getString("patient_gender"));
                result.put("patient_phone", rs.getString("patient_phone"));
                result.put("patient_address", rs.getString("patient_address"));
                
                results.add(result);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return results;
    }
    
    // Kiểm tra tỷ lệ hoàn thành kết quả xét nghiệm theo service order ID
    public Map<String, Object> getResultProgressByServiceOrderId(int serviceOrderId) {
        Map<String, Object> progress = new HashMap<>();
        String sql = """
            SELECT 
                COUNT(*) as total_services,
                COUNT(r.result_description) as completed_services
            FROM ServiceOrderItem soi
            LEFT JOIN ResultsOfParaclinicalServices r ON soi.service_order_item_id = r.service_order_item_id
            WHERE soi.service_order_id = ?
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, serviceOrderId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                int totalServices = rs.getInt("total_services");
                int completedServices = rs.getInt("completed_services");
                
                double progressPercentage = totalServices > 0 ? 
                    (double) completedServices / totalServices * 100 : 0;
                
                progress.put("total_services", totalServices);
                progress.put("completed_services", completedServices);
                progress.put("progress_percentage", Math.round(progressPercentage));
                progress.put("is_complete", completedServices == totalServices && totalServices > 0);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return progress;
    }
    
    // Lấy chi tiết kết quả xét nghiệm với thông tin service order
    public List<Map<String, Object>> getDetailedResultsByMedicineRecordId(int medicineRecordId) {
        List<Map<String, Object>> results = new ArrayList<>();
        String sql = """
             SELECT 
                so.service_order_id,
                so.order_date,
                so.medicineRecord_id,
                soi.service_order_item_id,
                lms.service_id,
                lms.name as service_name,
                lms.description as service_desc,
                lms.price as service_price,
                r.result_id,
                r.result_description,
                r.created_at as result_date,
                d.full_name as doctor_name,
                p.patient_id,
                p.full_name as patient_name,
                p.dob as patient_dob,
                p.gender as patient_gender,
                p.phone as patient_phone,
                p.address as patient_address
            FROM ServiceOrder so
            JOIN ServiceOrderItem soi ON so.service_order_id = soi.service_order_id
            JOIN ListOfMedicalService lms ON soi.service_id = lms.service_id
            LEFT JOIN MedicineRecords mr ON so.medicineRecord_id = mr.medicineRecord_id
            LEFT JOIN Patient p ON mr.patient_id = p.patient_id
            LEFT JOIN ResultsOfParaclinicalServices r ON soi.service_order_item_id = r.service_order_item_id
            LEFT JOIN Doctor d ON soi.doctor_id = d.doctor_id
            WHERE so.medicineRecord_id = ?
            ORDER BY so.order_date DESC, lms.name ASC
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, medicineRecordId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> result = new HashMap<>();
                result.put("service_order_id", rs.getInt("service_order_id"));
                result.put("order_date", rs.getString("order_date"));
                result.put("medicineRecord_id", rs.getInt("medicineRecord_id"));
                result.put("service_order_item_id", rs.getInt("service_order_item_id"));
                result.put("service_id", rs.getInt("service_id"));
                result.put("service_name", rs.getString("service_name"));
                result.put("service_description", rs.getString("service_desc"));
                result.put("service_price", rs.getDouble("service_price"));
                result.put("result_id", rs.getObject("result_id"));
                result.put("result_description", rs.getString("result_description"));
                result.put("result_date", rs.getString("result_date"));
                result.put("doctor_name", rs.getString("doctor_name"));
                result.put("is_completed", rs.getString("result_description") != null);
                
                // Thông tin bệnh nhân
                result.put("patient_id", rs.getInt("patient_id"));
                result.put("patient_name", rs.getString("patient_name"));
                result.put("patient_dob", rs.getString("patient_dob"));
                result.put("patient_gender", rs.getString("patient_gender"));
                result.put("patient_phone", rs.getString("patient_phone"));
                result.put("patient_address", rs.getString("patient_address"));
                
                results.add(result);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return results;
    }
    
    // Tạo hoặc cập nhật kết quả xét nghiệm
    public boolean createOrUpdateResult(int serviceOrderItemId, String resultDescription) {
        // Kiểm tra xem đã có kết quả chưa
        ResultsOfParaclinicalServices existingResult = getResultByServiceOrderItemId(serviceOrderItemId);
        
        if (existingResult != null) {
            // Cập nhật kết quả hiện có
            String updateSql = "UPDATE ResultsOfParaclinicalServices SET result_description = ? WHERE service_order_item_id = ?";
            
            try (Connection conn = DBContext.getInstance().getConnection();
                 PreparedStatement ps = conn.prepareStatement(updateSql)) {
                
                ps.setString(1, resultDescription);
                ps.setInt(2, serviceOrderItemId);
                
                return ps.executeUpdate() > 0;
                
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            // Tạo kết quả mới
            String insertSql = "INSERT INTO ResultsOfParaclinicalServices (service_order_item_id, result_description, created_at) VALUES (?, ?, NOW())";
            
            try (Connection conn = DBContext.getInstance().getConnection();
                 PreparedStatement ps = conn.prepareStatement(insertSql)) {
                
                ps.setInt(1, serviceOrderItemId);
                ps.setString(2, resultDescription);
                
                return ps.executeUpdate() > 0;
                
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        return false;
    }
} 