package controller;

import dao.MedicineDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/medicine/list")
public class MedicineServlet extends HttpServlet {
    
    private final MedicineDAO medicineDAO = new MedicineDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            List<Map<String, Object>> medicines = medicineDAO.getAllMedicines();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", medicines);
            result.put("message", "Danh sách thuốc được tải thành công");
            
            out.print(gson.toJson(result));
            
        } catch (Exception e) {
            e.printStackTrace();
            
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Lỗi khi tải danh sách thuốc: " + e.getMessage());
            errorResult.put("data", null);
            
            out.print(gson.toJson(errorResult));
        }
    }
} 