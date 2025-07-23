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

@WebServlet("/api/patient/feedback/update")
public class UpdateFeedbackServlet extends HttpServlet {
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");

        BufferedReader reader = req.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);

        Gson gson = new Gson();
        FeedbackUpdateRequest update = gson.fromJson(sb.toString(), FeedbackUpdateRequest.class);

        FeedbackDAO dao = new FeedbackDAO();
        boolean updated = dao.updateFeedbackById(update.feedbackId, update.newContent);

        resp.getWriter().write("{\"success\":" + updated + "}");
    }

    private static class FeedbackUpdateRequest {
        int feedbackId;
        String newContent;
    }
}