package controller;

import dao.AdminFeedbackDAO;
import model.Feedback;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/admin/feedback")
public class AdminFeedbackServlet extends HttpServlet {
    private final AdminFeedbackDAO feedbackDAO = new AdminFeedbackDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        List<Feedback> feedbackList = feedbackDAO.getAllFeedbackWithPatient();
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(gson.toJson(feedbackList));
    }
} 