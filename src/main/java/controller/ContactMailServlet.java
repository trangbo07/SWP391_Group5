package controller;

import util.EmailService;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/contact-mail")
public class ContactMailServlet extends HttpServlet {
    private static final String[] RECEIVERS = {"kivicare@gmail.com", "nguyenkhactrang2911@gmail.com"};

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        Gson gson = new Gson();
        Map<String, Object> result = new HashMap<>();

        // Đọc JSON body
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        JsonObject json = null;
        try {
            json = gson.fromJson(sb.toString(), JsonObject.class);
        } catch (Exception e) {
            resp.setStatus(400);
            result.put("success", false);
            result.put("error", "Dữ liệu gửi lên không hợp lệ.");
            gson.toJson(result, resp.getWriter());
            return;
        }
        String name = json != null && json.has("name") ? json.get("name").getAsString() : null;
        String email = json != null && json.has("email") ? json.get("email").getAsString() : null;
        String message = json != null && json.has("message") ? json.get("message").getAsString() : null;

        if (name == null || email == null || message == null
                || name.trim().isEmpty() || email.trim().isEmpty() || message.trim().isEmpty()) {
            resp.setStatus(400);
            result.put("success", false);
            result.put("error", "Thiếu thông tin bắt buộc.");
            gson.toJson(result, resp.getWriter());
            return;
        }

        String subject = "[Liên hệ từ website] - " + name;
        String content = "<b>Họ tên:</b> " + name + "<br>"
                + "<b>Email:</b> " + email + "<br>"
                + "<b>Nội dung:</b><br>" + message;
        boolean sent = true;
        for (String to : RECEIVERS) {
            sent &= EmailService.sendEmail(to, subject, content);
        }
        if (sent) {
            result.put("success", true);
        } else {
            resp.setStatus(500);
            result.put("success", false);
            result.put("error", "Không gửi được email. Vui lòng thử lại sau.");
        }
        gson.toJson(result, resp.getWriter());
    }
} 