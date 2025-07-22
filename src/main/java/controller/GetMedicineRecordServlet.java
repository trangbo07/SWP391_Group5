package controller;

import com.google.gson.Gson;
import dao.MedicineRecordDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/get-medicine-record")
public class GetMedicineRecordServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int patientId = Integer.parseInt(request.getParameter("patientId"));

        MedicineRecordDAO dao = new MedicineRecordDAO();
        // Giả sử hàm trả về danh sách DTO vì có thể có nhiều đơn thuốc
        var records = dao.getMedicineRecordsByPatientId(patientId);
        System.out.println(records);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        new Gson().toJson(records, response.getWriter());
    }
}
