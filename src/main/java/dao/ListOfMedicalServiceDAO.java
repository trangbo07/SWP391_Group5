package dao;

import model.ListOfMedicalService;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ListOfMedicalServiceDAO {
    
    public List<ListOfMedicalService> getAllServices() {
        List<ListOfMedicalService> services = new ArrayList<>();
        String sql = "SELECT * FROM ListOfMedicalService ORDER BY name";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
       
            while (rs.next()) {
                services.add(new ListOfMedicalService(
                    rs.getInt("service_id"),
                    rs.getString("name"),
                    rs.getString("description"),
                    rs.getDouble("price")
                ));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return services;
    }
    
    public List<Map<String, Object>> getAllServicesAsMap() {
        List<Map<String, Object>> services = new ArrayList<>();
        String sql = "SELECT service_id, name, description, price FROM ListOfMedicalService ORDER BY name";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                Map<String, Object> service = new HashMap<>();
                service.put("service_id", rs.getInt("service_id"));
                service.put("service_name", rs.getString("name"));
                service.put("description", rs.getString("description"));
                service.put("price", rs.getDouble("price"));
                services.add(service);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return services;
    }
    
    public ListOfMedicalService getServiceById(int serviceId) {
        String sql = "SELECT * FROM ListOfMedicalService WHERE service_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, serviceId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return new ListOfMedicalService(
                    rs.getInt("service_id"),
                    rs.getString("name"),
                    rs.getString("description"),
                    rs.getDouble("price")
                );
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    public boolean addService(ListOfMedicalService service) {
        String sql = "INSERT INTO ListOfMedicalService (name, description, price) VALUES (?, ?, ?)";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, service.getName());
            ps.setString(2, service.getDescription());
            ps.setDouble(3, service.getPrice());
            
            int result = ps.executeUpdate();
            return result > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean updateService(ListOfMedicalService service) {
        String sql = "UPDATE ListOfMedicalService SET name = ?, description = ?, price = ? WHERE service_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, service.getName());
            ps.setString(2, service.getDescription());
            ps.setDouble(3, service.getPrice());
            ps.setInt(4, service.getService_id());
            
            int result = ps.executeUpdate();
            return result > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean deleteService(int serviceId) {
        String sql = "DELETE FROM ListOfMedicalService WHERE service_id = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, serviceId);
            
            int result = ps.executeUpdate();
            return result > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean serviceExists(String name) {
        String sql = "SELECT COUNT(*) FROM ListOfMedicalService WHERE name = ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, name);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return false;
    }
    
    public boolean serviceExistsExcludeId(String name, int serviceId) {
        String sql = "SELECT COUNT(*) FROM ListOfMedicalService WHERE name = ? AND service_id != ?";
        
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, name);
            ps.setInt(2, serviceId);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return false;
    }
    
    public List<ListOfMedicalService> searchServicesByName(String name) {
        List<ListOfMedicalService> services = new ArrayList<>();
        String sql = "SELECT * FROM ListOfMedicalService WHERE name LIKE ? ORDER BY name";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, "%" + name + "%");
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                services.add(new ListOfMedicalService(
                    rs.getInt("service_id"),
                    rs.getString("name"),
                    rs.getString("description"),
                    rs.getDouble("price")
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return services;
    }
} 