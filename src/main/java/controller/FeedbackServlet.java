package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.FeedbackDAO;
import model.Feedback;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountPatient;

import java.io.IOException;
import java.util.List;

@WebServlet("/feedback")
public class FeedbackServlet extends HttpServlet {

    private final FeedbackDAO feedbackDAO = new FeedbackDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession();
        AccountPatient account = (AccountPatient) session.getAttribute("user");

        if (account == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("{\"error\": \"Chưa đăng nhập\"}");
            return;
        }

        int accountPatientId = account.getAccount_patient_id(); // ✅ đã là int, không cần parse

        try {
            List<Feedback> feedbackList = feedbackDAO.getFeedbackByAccountPatientId(accountPatientId);

            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(feedbackList);
            response.getWriter().write(json);

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Server error: " + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }
}
