package dao;

import model.Medicine;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MedicineDAO {

    public List<Map<String, Object>> getAllMedicines() {
        List<Map<String, Object>> medicines = new ArrayList<>();
        String sql = "SELECT medicine_id, name, price, ingredient, usage FROM Medicine WHERE quantity > 0 ORDER BY name";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> medicine = new HashMap<>();
                medicine.put("medicine_id", rs.getInt("medicine_id"));
                medicine.put("medicine_name", rs.getString("name"));
                medicine.put("price", rs.getDouble("price"));
                medicine.put("ingredient", rs.getString("ingredient"));
                medicine.put("usage", rs.getString("usage"));
                medicines.add(medicine);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return medicines;
    }

    public List<Medicine> getAllMedicinesAsList() {
        List<Medicine> medicines = new ArrayList<>();
        String sql = "SELECT * FROM Medicine WHERE quantity > 0 ORDER BY name";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                medicines.add(new Medicine(
                        rs.getInt("medicine_id"),
                        rs.getInt("unit_id"),
                        rs.getInt("category_id"),
                        rs.getInt("quantity"),
                        rs.getString("name"),
                        rs.getString("ingredient"),
                        rs.getString("usage"),
                        rs.getString("preservation"),
                        rs.getString("manuDate"),
                        rs.getString("expDate"),
                        rs.getString("warehouse_id"),
                        rs.getDouble("price")
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return medicines;
    }

    public Medicine getMedicineById(int medicineId) {
        String sql = "SELECT * FROM Medicine WHERE medicine_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, medicineId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new Medicine(
                        rs.getInt("medicine_id"),
                        rs.getInt("unit_id"),
                        rs.getInt("category_id"),
                        rs.getInt("quantity"),
                        rs.getString("name"),
                        rs.getString("ingredient"),
                        rs.getString("usage"),
                        rs.getString("preservation"),
                        rs.getString("manuDate"),
                        rs.getString("expDate"),
                        rs.getString("warehouse_id"),
                        rs.getDouble("price")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public boolean updateMedicineQuantity(int medicineId, int newQuantity) {
        String sql = "UPDATE Medicine SET quantity = ? WHERE medicine_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, newQuantity);
            ps.setInt(2, medicineId);

            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
} 