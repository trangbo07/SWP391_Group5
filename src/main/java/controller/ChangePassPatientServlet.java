package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import dao.PatientDAO; // bạn đang dùng PatientDAO chứ không phải AppoinmentPatientDAO
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import model.AccountPatient;
import org.json.JSONObject; // Chắc chắn bạn đang dùng JSONObject từ org.json

@WebServlet("/change-password")
public class ChangePassPatientServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession();
        AccountPatient account = (AccountPatient) session.getAttribute("user");

        if (account == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("{\"error\": \"Chưa đăng nhập\"}");
            return;
        }

        int accountPatientId = account.getAccount_patient_id(); // ✅ đã là int, không cần parse


        BufferedReader reader = request.getReader();
        StringBuilder jsonBuffer = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            jsonBuffer.append(line);
        }
        JSONObject json = new JSONObject(jsonBuffer.toString());

        String oldPassword = json.getString("oldPassword");
        String newPassword = json.getString("newPassword");

        PatientDAO dao = new PatientDAO();




        out.print("{\"message\": \"Đổi mật khẩu thành công.\"}");
    }
}
