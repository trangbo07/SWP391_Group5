package dao;

import model.ServiceOrderItem;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ServiceOrderItemDAO {

    public boolean createServiceOrderItem(ServiceOrderItem item) {
        String sql = """
            INSERT INTO ServiceOrderItem (service_order_id, service_id, doctor_id)
            VALUES (?, ?, ?)
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, item.getService_order_id());
            ps.setInt(2, item.getService_id());
            ps.setInt(3, item.getDoctor_id());

            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean createMultipleServiceOrderItems(int serviceOrderId, int doctorId, List<Integer> serviceIds) {
        String sql = """
            INSERT INTO ServiceOrderItem (service_order_id, service_id, doctor_id)
            VALUES (?, ?, ?)
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (Integer serviceId : serviceIds) {
                ps.setInt(1, serviceOrderId);
                ps.setInt(2, serviceId);
                ps.setInt(3, doctorId);
                ps.addBatch();
            }

            int[] results = ps.executeBatch();
            for (int result : results) {
                if (result <= 0) {
                    return false;
                }
            }
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Map<String, Object>> getServiceOrderItemsWithDetails(int serviceOrderId) {
        List<Map<String, Object>> items = new ArrayList<>();
        String sql = """
            SELECT 
                soi.service_order_item_id,
                soi.service_order_id,
                soi.service_id,
                soi.doctor_id,
                lms.name AS service_name,
                lms.description AS service_description,
                lms.price AS service_price,
                d.full_name AS doctor_name
            FROM ServiceOrderItem soi
            JOIN ListOfMedicalService lms ON soi.service_id = lms.service_id
            JOIN Doctor d ON soi.doctor_id = d.doctor_id
            WHERE soi.service_order_id = ?
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, serviceOrderId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("service_order_item_id", rs.getInt("service_order_item_id"));
                item.put("service_order_id", rs.getInt("service_order_id"));
                item.put("service_id", rs.getInt("service_id"));
                item.put("doctor_id", rs.getInt("doctor_id"));
                item.put("service_name", rs.getString("service_name"));
                item.put("service_description", rs.getString("service_description"));
                item.put("service_price", rs.getDouble("service_price"));
                item.put("doctor_name", rs.getString("doctor_name"));
                items.add(item);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return items;
    }

    public List<ServiceOrderItem> getServiceOrderItemsByServiceOrderId(int serviceOrderId) {
        List<ServiceOrderItem> items = new ArrayList<>();
        String sql = "SELECT * FROM ServiceOrderItem WHERE service_order_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, serviceOrderId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                items.add(new ServiceOrderItem(
                        rs.getInt("service_order_item_id"),
                        rs.getInt("service_order_id"),
                        rs.getInt("service_id"),
                        rs.getInt("doctor_id")
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return items;
    }

    public ServiceOrderItem getServiceOrderItemById(int serviceOrderItemId) {
        String sql = "SELECT * FROM ServiceOrderItem WHERE service_order_item_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, serviceOrderItemId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new ServiceOrderItem(
                        rs.getInt("service_order_item_id"),
                        rs.getInt("service_order_id"),
                        rs.getInt("service_id"),
                        rs.getInt("doctor_id")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public boolean deleteServiceOrderItem(int serviceOrderItemId) {
        String sql = "DELETE FROM ServiceOrderItem WHERE service_order_item_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, serviceOrderItemId);

            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean createMultipleServiceOrderItemsWithDoctors(List<ServiceOrderItem> items) {
        String sql = """
            INSERT INTO ServiceOrderItem (service_order_id, service_id, doctor_id)
            VALUES (?, ?, ?)
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (ServiceOrderItem item : items) {
                ps.setInt(1, item.getService_order_id());
                ps.setInt(2, item.getService_id());
                ps.setInt(3, item.getDoctor_id());
                ps.addBatch();
            }

            int[] results = ps.executeBatch();
            for (int result : results) {
                if (result <= 0) {
                    return false;
                }
            }
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Map<String, Object>> getAssignedServicesByDoctorId(int doctorId) {
        List<Map<String, Object>> assignedServices = new ArrayList<>();
        String sql = """
            SELECT 
                soi.service_order_item_id,
                soi.service_order_id,
                soi.service_id,
                soi.doctor_id,
                lms.name AS service_name,
                lms.description AS service_description,
                lms.price AS service_price,
                d.full_name AS doctor_name,
                p.full_name AS patient_name,
                mr.medicineRecord_id,
                so.order_date,
                er.symptoms,
                er.preliminary_diagnosis,
                rps.result_description,
                rps.created_at AS result_date
            FROM ServiceOrderItem soi
            JOIN ListOfMedicalService lms ON soi.service_id = lms.service_id
            JOIN Doctor d ON soi.doctor_id = d.doctor_id
            JOIN ServiceOrder so ON soi.service_order_id = so.service_order_id
            JOIN MedicineRecords mr ON so.medicineRecord_id = mr.medicineRecord_id
            JOIN Patient p ON mr.patient_id = p.patient_id
            LEFT JOIN (
                SELECT er1.medicineRecord_id, er1.symptoms, er1.preliminary_diagnosis
                FROM ExamResult er1
                WHERE er1.exam_result_id = (
                    SELECT MAX(er2.exam_result_id) 
                    FROM ExamResult er2 
                    WHERE er2.medicineRecord_id = er1.medicineRecord_id
                )
            ) er ON mr.medicineRecord_id = er.medicineRecord_id
            LEFT JOIN (
                SELECT rps1.service_order_item_id, rps1.result_description, rps1.created_at
                FROM ResultsOfParaclinicalServices rps1
                WHERE rps1.result_id = (
                    SELECT MAX(rps2.result_id) 
                    FROM ResultsOfParaclinicalServices rps2 
                    WHERE rps2.service_order_item_id = rps1.service_order_item_id
                )
            ) rps ON soi.service_order_item_id = rps.service_order_item_id
            WHERE soi.doctor_id = ?
            ORDER BY so.order_date DESC
        """;

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, doctorId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Map<String, Object> service = new HashMap<>();
                service.put("service_order_item_id", rs.getInt("service_order_item_id"));
                service.put("service_order_id", rs.getInt("service_order_id"));
                service.put("service_id", rs.getInt("service_id"));
                service.put("doctor_id", rs.getInt("doctor_id"));
                service.put("service_name", rs.getString("service_name"));
                service.put("service_description", rs.getString("service_description"));
                service.put("service_price", rs.getDouble("service_price"));
                service.put("doctor_name", rs.getString("doctor_name"));
                service.put("patient_name", rs.getString("patient_name"));
                service.put("medicineRecord_id", rs.getInt("medicineRecord_id"));
                service.put("order_date", rs.getString("order_date"));
                service.put("symptoms", rs.getString("symptoms"));
                service.put("preliminary_diagnosis", rs.getString("preliminary_diagnosis"));
                service.put("result_description", rs.getString("result_description"));
                service.put("result_date", rs.getString("result_date"));
                assignedServices.add(service);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return assignedServices;
    }
} 