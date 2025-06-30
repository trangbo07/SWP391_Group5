package dao;

import model.ServiceOrder;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ServiceOrderDAO {
    
    public int createServiceOrder(int doctorId, int medicineRecordId) {
        String sql = """
            INSERT INTO ServiceOrder (doctor_id, medicineRecord_id, order_date)
            VALUES (?, ?, ?)
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            
            ps.setInt(1, doctorId);
            ps.setInt(2, medicineRecordId);
            ps.setString(3, currentDate);
            
            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return -1;
    }
    
    public ServiceOrder getServiceOrderById(int serviceOrderId) {
        String sql = "SELECT * FROM ServiceOrder WHERE service_order_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, serviceOrderId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return new ServiceOrder(
                    rs.getInt("service_order_id"),
                    rs.getInt("doctor_id"),
                    rs.getInt("medicineRecord_id"),
                    rs.getString("order_date")
                );
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    public Map<String, Object> getServiceOrderWithDetails(int serviceOrderId) {
        String sql = """
            SELECT 
                so.service_order_id,
                so.doctor_id,
                so.medicineRecord_id,
                so.order_date,
                d.full_name AS doctor_name,
                p.full_name AS patient_name
            FROM ServiceOrder so
            JOIN Doctor d ON so.doctor_id = d.doctor_id
            JOIN MedicineRecords mr ON so.medicineRecord_id = mr.medicineRecord_id
            JOIN Patient p ON mr.patient_id = p.patient_id
            WHERE so.service_order_id = ?
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, serviceOrderId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                Map<String, Object> details = new HashMap<>();
                details.put("service_order_id", rs.getInt("service_order_id"));
                details.put("doctor_id", rs.getInt("doctor_id"));
                details.put("medicineRecord_id", rs.getInt("medicineRecord_id"));
                details.put("order_date", rs.getString("order_date"));
                details.put("doctor_name", rs.getString("doctor_name"));
                details.put("patient_name", rs.getString("patient_name"));
                return details;
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    public List<Map<String, Object>> getServiceOrdersByPatientName(String patientName, int doctorId) {
        List<Map<String, Object>> orders = new ArrayList<>();
        String sql = """
            SELECT 
                so.service_order_id,
                so.doctor_id,
                so.medicineRecord_id,
                so.order_date,
                d.full_name AS doctor_name,
                p.full_name AS patient_name
            FROM ServiceOrder so
            JOIN Doctor d ON so.doctor_id = d.doctor_id
            JOIN MedicineRecords mr ON so.medicineRecord_id = mr.medicineRecord_id
            JOIN Patient p ON mr.patient_id = p.patient_id
            WHERE so.doctor_id = ?
            ORDER BY so.order_date DESC
        """;
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, doctorId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> order = new HashMap<>();
                order.put("service_order_id", rs.getInt("service_order_id"));
                order.put("doctor_id", rs.getInt("doctor_id"));
                order.put("medicineRecord_id", rs.getInt("medicineRecord_id"));
                order.put("order_date", rs.getString("order_date"));
                order.put("doctor_name", rs.getString("doctor_name"));
                order.put("patient_name", rs.getString("patient_name"));
                orders.add(order);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return orders;
    }
    
    public List<ServiceOrder> getServiceOrdersByMedicineRecordId(int medicineRecordId) {
        List<ServiceOrder> orders = new ArrayList<>();
        String sql = "SELECT * FROM ServiceOrder WHERE medicineRecord_id = ? ORDER BY order_date DESC";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, medicineRecordId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                orders.add(new ServiceOrder(
                    rs.getInt("service_order_id"),
                    rs.getInt("doctor_id"),
                    rs.getInt("medicineRecord_id"),
                    rs.getString("order_date")
                ));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return orders;
    }
    
    public List<ServiceOrder> getServiceOrdersByDoctorId(int doctorId) {
        List<ServiceOrder> orders = new ArrayList<>();
        String sql = "SELECT * FROM ServiceOrder WHERE doctor_id = ? ORDER BY order_date DESC";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, doctorId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                orders.add(new ServiceOrder(
                    rs.getInt("service_order_id"),
                    rs.getInt("doctor_id"),
                    rs.getInt("medicineRecord_id"),
                    rs.getString("order_date")
                ));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return orders;
    }
    
    public List<ServiceOrder> getAllServiceOrders() {
        List<ServiceOrder> orders = new ArrayList<>();
        String sql = "SELECT * FROM ServiceOrder ORDER BY order_date DESC";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                orders.add(new ServiceOrder(
                    rs.getInt("service_order_id"),
                    rs.getInt("doctor_id"),
                    rs.getInt("medicineRecord_id"),
                    rs.getString("order_date")
                ));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return orders;
    }
} 