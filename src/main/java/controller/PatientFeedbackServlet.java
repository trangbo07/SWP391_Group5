package controller;

import com.google.gson.Gson;
import dao.FeedbackDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/api/patient/feedback")
public class PatientFeedbackServlet extends HttpServlet {
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        HttpSession session = req.getSession();
        int patientId = ((model.AccountPatient) session.getAttribute("user")).getAccount_patient_id();

        FeedbackDAO dao = new FeedbackDAO();
        var feedbackList = dao.getFeedback(patientId);

        PrintWriter out = resp.getWriter();
        out.print(gson.toJson(feedbackList));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        handleFeedback(req, resp); // 👈 gọi vào đây
    }

    private void handleFeedback(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");

        // Lấy JSON từ body
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
        }

        FeedbackRequest request = gson.fromJson(sb.toString(), FeedbackRequest.class);

        // Lấy user từ session
        HttpSession session = req.getSession();
        int patientId = ((model.AccountPatient) session.getAttribute("user")).getAccount_patient_id();

        // Gửi đánh giá
        FeedbackDAO dao = new FeedbackDAO();
        boolean inserted = dao.insertFeedback(patientId, request.doctorId, request.comment);

        PrintWriter out = resp.getWriter();
        if (inserted) {
            out.print("{\"success\":true}");
        } else {
            out.print("{\"success\":false,\"message\":\"Bạn đã đánh giá bác sĩ này rồi!\"}");
        }
    }

    // Lớp request model
    private static class FeedbackRequest {
        int doctorId;
        String comment;
    }
}
