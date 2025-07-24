package controller;


import dao.PatientDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountPatient;
import org.json.JSONObject;
import util.PasswordHasherSHA256Util;

import java.io.*;

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
        System.out.println(accountPatientId);
        JSONObject json = new JSONObject(jsonBuffer.toString());
        String oldPassword = json.getString("oldPassword");
        String hashedOldPassword = PasswordHasherSHA256Util.hashPassword(oldPassword);
        String newPassword = json.getString("newPassword");
        String hashedPassword = PasswordHasherSHA256Util.hashPassword(newPassword);
        PatientDAO resetDAO = new PatientDAO();
        boolean success = resetDAO.updatePasswordIfMatch(accountPatientId, hashedOldPassword, hashedPassword);
        if (success) {
            out.print("{\"message\": \"Đổi mật khẩu thành công\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\": \"Mật khẩu cũ không đúng hoặc tài khoản không tồn tại\"}");
        }
    }
}