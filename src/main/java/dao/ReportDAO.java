package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import util.DBConnection;

public class ReportDAO {
    // Report for Total Revenue
    public Map<String, Object> getTotalRevenueReport() throws SQLException {
        Map<String, Object> report = new HashMap<>();
        String query = "SELECT " +
            "SUM(total_amount) as total_revenue, " +
            "COUNT(DISTINCT invoice_id) as total_invoices, " +
            "AVG(total_amount) as average_invoice_amount " +
            "FROM Invoice " +
            "WHERE status = 'Paid'";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query);
             ResultSet rs = pstmt.executeQuery()) {
            
            if (rs.next()) {
                report.put("total_revenue", rs.getDouble("total_revenue"));
                report.put("total_invoices", rs.getInt("total_invoices"));
                report.put("average_invoice_amount", rs.getDouble("average_invoice_amount"));
            }
        }
        return report;
    }

    // Report for Service Usage
    public List<Map<String, Object>> getServiceUsageReport() throws SQLException {
        List<Map<String, Object>> report = new ArrayList<>();
        String query = "SELECT " +
            "ls.name as service_name, " +
            "COUNT(soi.service_order_item_id) as service_count, " +
            "SUM(si.total_price) as total_service_revenue " +
            "FROM ListOfMedicalService ls " +
            "LEFT JOIN ServiceOrderItem soi ON ls.service_id = soi.service_id " +
            "LEFT JOIN ServiceInvoice si ON soi.service_order_item_id = si.service_order_item_id " +
            "GROUP BY ls.name " +
            "ORDER BY service_count DESC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                Map<String, Object> serviceReport = new HashMap<>();
                serviceReport.put("service_name", rs.getString("service_name"));
                serviceReport.put("service_count", rs.getInt("service_count"));
                serviceReport.put("total_service_revenue", rs.getDouble("total_service_revenue"));
                report.add(serviceReport);
            }
        }
        return report;
    }

    // Report for Patient Visits
    public Map<String, Object> getPatientVisitReport() throws SQLException {
        Map<String, Object> report = new HashMap<>();
        String query = "SELECT " +
            "COUNT(DISTINCT patient_id) as total_patients, " +
            "COUNT(appointment_id) as total_appointments, " +
            "COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_appointments, " +
            "COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_appointments " +
            "FROM Appointment";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query);
             ResultSet rs = pstmt.executeQuery()) {
            
            if (rs.next()) {
                report.put("total_patients", rs.getInt("total_patients"));
                report.put("total_appointments", rs.getInt("total_appointments"));
                report.put("completed_appointments", rs.getInt("completed_appointments"));
                report.put("cancelled_appointments", rs.getInt("cancelled_appointments"));
            }
        }
        return report;
    }

    // Report for Medicine Inventory
    public List<Map<String, Object>> getMedicineInventoryReport() throws SQLException {
        List<Map<String, Object>> report = new ArrayList<>();
        String query = "SELECT " +
            "m.name as medicine_name, " +
            "m.quantity as current_stock, " +
            "COALESCE(c.categoryName, 'Uncategorized') as category, " +
            "m.price, " +
            "m.expDate " +
            "FROM Medicine m " +
            "LEFT JOIN Category c ON m.category_id = c.category_id " +
            "ORDER BY m.quantity ASC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query);
             ResultSet rs = pstmt.executeQuery()) {
            
            if (!rs.isBeforeFirst()) {
                System.err.println("No medicine inventory data found.");
            }
            
            while (rs.next()) {
                Map<String, Object> medicineReport = new HashMap<>();
                medicineReport.put("medicine_name", rs.getString("medicine_name"));
                medicineReport.put("current_stock", rs.getInt("current_stock"));
                medicineReport.put("category", rs.getString("category"));
                medicineReport.put("price", rs.getDouble("price"));
                
                Date expDate = rs.getDate("expDate");
                medicineReport.put("expiration_date", expDate != null ? expDate : null);
                
                report.add(medicineReport);
            }
        } catch (SQLException e) {
            System.err.println("Error in getMedicineInventoryReport: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        return report;
    }
} 