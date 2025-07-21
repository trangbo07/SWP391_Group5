package controller;

import dao.MedicineWarehouseDAO;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Date;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@WebServlet("/medicine-warehouse/*")
public class MedicineWarehouseServlet extends HttpServlet {
    private MedicineWarehouseDAO medicineDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        medicineDAO = new MedicineWarehouseDAO();
        gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        
        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all medicines
                List<Map<String, Object>> medicines = medicineDAO.getAllMedicines();
                sendJsonResponse(response, medicines);
            } else if (pathInfo.startsWith("/search")) {
                // Search medicines
                String searchTerm = request.getParameter("term");
                if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                    List<Map<String, Object>> medicines = medicineDAO.searchMedicinesByName(searchTerm);
                    sendJsonResponse(response, medicines);
                } else {
                    List<Map<String, Object>> medicines = medicineDAO.getAllMedicines();
                    sendJsonResponse(response, medicines);
                }
            } else if (pathInfo.startsWith("/categories")) {
                // Get all categories
                List<Map<String, Object>> categories = medicineDAO.getAllCategories();
                sendJsonResponse(response, categories);
            } else if (pathInfo.startsWith("/units")) {
                // Get all units
                List<Map<String, Object>> units = medicineDAO.getAllUnits();
                sendJsonResponse(response, units);
            } else if (pathInfo.startsWith("/warehouses")) {
                // Get all warehouses
                List<Map<String, Object>> warehouses = medicineDAO.getAllWarehouses();
                sendJsonResponse(response, warehouses);
            } else if (pathInfo.startsWith("/inventory-report")) {
                // Get inventory report
                List<Map<String, Object>> report = medicineDAO.getMedicineInventoryReport();
                sendJsonResponse(response, report);
            } else {
                // Get medicine by ID
                String[] pathParts = pathInfo.split("/");
                if (pathParts.length > 1) {
                    try {
                        int medicineId = Integer.parseInt(pathParts[1]);
                        Map<String, Object> medicine = medicineDAO.getMedicineById(medicineId);
                        if (medicine != null) {
                            sendJsonResponse(response, medicine);
                        } else {
                            sendErrorResponse(response, "Medicine not found", 404);
                        }
                    } catch (NumberFormatException e) {
                        sendErrorResponse(response, "Invalid medicine ID", 400);
                    }
                } else {
                    sendErrorResponse(response, "Invalid request", 400);
                }
            }
        } catch (SQLException e) {
            sendErrorResponse(response, "Database error: " + e.getMessage(), 500);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        try {
            // Read JSON from request body
            StringBuilder sb = new StringBuilder();
            String line;
            try (java.io.BufferedReader reader = request.getReader()) {
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            
            String jsonBody = sb.toString();
            System.out.println("=== POST Request JSON Body ===");
            System.out.println(jsonBody);
            System.out.println("===============================");
            
            // Parse JSON
            JsonObject jsonObject = gson.fromJson(jsonBody, JsonObject.class);
            
            // Add new medicine
            String name = jsonObject.has("name") ? jsonObject.get("name").getAsString() : null;
            String unitIdStr = jsonObject.has("unitId") ? jsonObject.get("unitId").getAsString() : null;
            String categoryIdStr = jsonObject.has("categoryId") ? jsonObject.get("categoryId").getAsString() : null;
            String ingredient = jsonObject.has("ingredient") ? jsonObject.get("ingredient").getAsString() : null;
            String usage = jsonObject.has("usage") ? jsonObject.get("usage").getAsString() : null;
            String preservation = jsonObject.has("preservation") ? jsonObject.get("preservation").getAsString() : null;
            String manuDateStr = jsonObject.has("manuDate") ? jsonObject.get("manuDate").getAsString() : null;
            String expDateStr = jsonObject.has("expDate") ? jsonObject.get("expDate").getAsString() : null;
            String quantityStr = jsonObject.has("quantity") ? jsonObject.get("quantity").getAsString() : null;
            String priceStr = jsonObject.has("price") ? jsonObject.get("price").getAsString() : null;
            String warehouseIdStr = jsonObject.has("warehouseId") ? jsonObject.get("warehouseId").getAsString() : null;

            // Debug: Print specific parameters
            System.out.println("name = " + name);
            System.out.println("unitIdStr = " + unitIdStr);
            System.out.println("categoryIdStr = " + categoryIdStr);

            // Validate required parameters with better error handling
            if (name == null || name.trim().isEmpty()) {
                System.out.println("ERROR: name is null or empty");
                sendErrorResponse(response, "Tên thuốc không được để trống", 400);
                return;
            }

            // Parse and validate numeric parameters
            int unitId, categoryId, quantity, warehouseId;
            double price;
            Date manuDate, expDate;

            try {
                unitId = Integer.parseInt(unitIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Đơn vị không hợp lệ", 400);
                return;
            }

            try {
                categoryId = Integer.parseInt(categoryIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Danh mục không hợp lệ", 400);
                return;
            }

            try {
                quantity = Integer.parseInt(quantityStr);
                if (quantity <= 0) {
                    sendErrorResponse(response, "Số lượng phải lớn hơn 0", 400);
                    return;
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Số lượng không hợp lệ", 400);
                return;
            }

            try {
                price = Double.parseDouble(priceStr);
                if (price <= 0) {
                    sendErrorResponse(response, "Giá phải lớn hơn 0", 400);
                    return;
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Giá không hợp lệ", 400);
                return;
            }

            try {
                warehouseId = Integer.parseInt(warehouseIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Kho không hợp lệ", 400);
                return;
            }

            try {
                manuDate = Date.valueOf(manuDateStr);
            } catch (IllegalArgumentException e) {
                sendErrorResponse(response, "Ngày sản xuất không hợp lệ", 400);
                return;
            }

            try {
                expDate = Date.valueOf(expDateStr);
            } catch (IllegalArgumentException e) {
                sendErrorResponse(response, "Ngày hết hạn không hợp lệ", 400);
                return;
            }

            boolean success = medicineDAO.addMedicine(name, unitId, categoryId, ingredient, 
                                                    usage, preservation, manuDate, expDate, 
                                                    quantity, price, warehouseId);

            JsonObject result = new JsonObject();
            if (success) {
                // Get the newly added medicine to return its ID
                List<Map<String, Object>> medicines = medicineDAO.getAllMedicines();
                int newMedicineId = -1;
                for (Map<String, Object> med : medicines) {
                    if (med.get("name").equals(name) && 
                        med.get("unit_id").equals(unitId) && 
                        med.get("category_id").equals(categoryId) &&
                        med.get("quantity").equals(quantity) &&
                        med.get("price").equals(price)) {
                        newMedicineId = (Integer) med.get("medicine_id");
                        break;
                    }
                }
                
                result.addProperty("success", true);
                result.addProperty("message", "Thêm thuốc thành công");
                result.addProperty("medicine_id", newMedicineId);
            } else {
                result.addProperty("success", false);
                result.addProperty("message", "Thêm thuốc thất bại");
            }
            sendJsonResponse(response, result);

        } catch (Exception e) {
            sendErrorResponse(response, "Lỗi hệ thống: " + e.getMessage(), 500);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            sendErrorResponse(response, "ID thuốc không được để trống", 400);
            return;
        }

        try {
            String[] pathParts = pathInfo.split("/");
            int medicineId;
            try {
                medicineId = Integer.parseInt(pathParts[1]);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "ID thuốc không hợp lệ", 400);
                return;
            }

            // Read JSON from request body
            StringBuilder sb = new StringBuilder();
            String line;
            try (java.io.BufferedReader reader = request.getReader()) {
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            
            String jsonBody = sb.toString();
            System.out.println("=== PUT Request JSON Body ===");
            System.out.println(jsonBody);
            System.out.println("==============================");
            
            // Parse JSON
            JsonObject jsonObject = gson.fromJson(jsonBody, JsonObject.class);
            
            // Update medicine
            String name = jsonObject.has("name") ? jsonObject.get("name").getAsString() : null;
            String unitIdStr = jsonObject.has("unitId") ? jsonObject.get("unitId").getAsString() : null;
            String categoryIdStr = jsonObject.has("categoryId") ? jsonObject.get("categoryId").getAsString() : null;
            String ingredient = jsonObject.has("ingredient") ? jsonObject.get("ingredient").getAsString() : null;
            String usage = jsonObject.has("usage") ? jsonObject.get("usage").getAsString() : null;
            String preservation = jsonObject.has("preservation") ? jsonObject.get("preservation").getAsString() : null;
            String manuDateStr = jsonObject.has("manuDate") ? jsonObject.get("manuDate").getAsString() : null;
            String expDateStr = jsonObject.has("expDate") ? jsonObject.get("expDate").getAsString() : null;
            String quantityStr = jsonObject.has("quantity") ? jsonObject.get("quantity").getAsString() : null;
            String priceStr = jsonObject.has("price") ? jsonObject.get("price").getAsString() : null;
            String warehouseIdStr = jsonObject.has("warehouseId") ? jsonObject.get("warehouseId").getAsString() : null;

            // Debug: Print specific parameters
            System.out.println("name = " + name);
            System.out.println("unitIdStr = " + unitIdStr);
            System.out.println("categoryIdStr = " + categoryIdStr);

            // Validate required parameters
            if (name == null || name.trim().isEmpty()) {
                sendErrorResponse(response, "Tên thuốc không được để trống", 400);
                return;
            }

            // Parse and validate numeric parameters
            int unitId, categoryId, quantity, warehouseId;
            double price;
            Date manuDate, expDate;

            try {
                unitId = Integer.parseInt(unitIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Đơn vị không hợp lệ", 400);
                return;
            }

            try {
                categoryId = Integer.parseInt(categoryIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Danh mục không hợp lệ", 400);
                return;
            }

            try {
                quantity = Integer.parseInt(quantityStr);
                if (quantity <= 0) {
                    sendErrorResponse(response, "Số lượng phải lớn hơn 0", 400);
                    return;
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Số lượng không hợp lệ", 400);
                return;
            }

            try {
                price = Double.parseDouble(priceStr);
                if (price <= 0) {
                    sendErrorResponse(response, "Giá phải lớn hơn 0", 400);
                    return;
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Giá không hợp lệ", 400);
                return;
            }

            try {
                warehouseId = Integer.parseInt(warehouseIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Kho không hợp lệ", 400);
                return;
            }

            try {
                manuDate = Date.valueOf(manuDateStr);
            } catch (IllegalArgumentException e) {
                sendErrorResponse(response, "Ngày sản xuất không hợp lệ", 400);
                return;
            }

            try {
                expDate = Date.valueOf(expDateStr);
            } catch (IllegalArgumentException e) {
                sendErrorResponse(response, "Ngày hết hạn không hợp lệ", 400);
                return;
            }

            boolean success = medicineDAO.updateMedicine(medicineId, name, unitId, categoryId, 
                                                       ingredient, usage, preservation, manuDate, 
                                                       expDate, quantity, price, warehouseId);

            JsonObject result = new JsonObject();
            if (success) {
                result.addProperty("success", true);
                result.addProperty("message", "Cập nhật thuốc thành công");
            } else {
                result.addProperty("success", false);
                result.addProperty("message", "Cập nhật thuốc thất bại");
            }
            sendJsonResponse(response, result);

        } catch (Exception e) {
            sendErrorResponse(response, "Lỗi hệ thống: " + e.getMessage(), 500);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            sendErrorResponse(response, "ID thuốc không được để trống", 400);
            return;
        }

        try {
            String[] pathParts = pathInfo.split("/");
            int medicineId;
            try {
                medicineId = Integer.parseInt(pathParts[1]);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "ID thuốc không hợp lệ", 400);
                return;
            }

            boolean success = medicineDAO.deleteMedicine(medicineId);

            JsonObject result = new JsonObject();
            if (success) {
                result.addProperty("success", true);
                result.addProperty("message", "Xóa thuốc thành công");
            } else {
                result.addProperty("success", false);
                result.addProperty("message", "Xóa thuốc thất bại");
            }
            sendJsonResponse(response, result);

        } catch (Exception e) {
            sendErrorResponse(response, "Lỗi hệ thống: " + e.getMessage(), 500);
        }
    }

    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(gson.toJson(data));
    }

    private void sendErrorResponse(HttpServletResponse response, String message, int status) 
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        JsonObject error = new JsonObject();
        error.addProperty("success", false);
        error.addProperty("message", message);
        error.addProperty("status", status);
        
        response.getWriter().write(gson.toJson(error));
    }
} 