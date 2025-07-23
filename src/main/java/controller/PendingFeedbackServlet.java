package controller;

import com.google.gson.Gson;
import dao.FeedbackDAO;
import dto.PendingFeedbackDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountPatient;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/pending-feedback")
public class PendingFeedbackServlet extends HttpServlet {
    private FeedbackDAO feedbackDAO = new FeedbackDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        HttpSession session = req.getSession();;
        resp.setContentType("application/json;charset=UTF-8");

        AccountPatient account = (AccountPatient) session.getAttribute("user");
        if (account == null) {
            resp.setStatus(401);
            resp.getWriter().print("{\"error\": \"Chưa đăng nhập\"}");
            return;
        }
        int accountId = account.getAccount_patient_id();

        List<PendingFeedbackDTO> pendingList = feedbackDAO.getPendingFeedbackByAccountId(accountId);
        System.out.println(pendingList);
        String json = new Gson().toJson(pendingList);

        PrintWriter out = resp.getWriter();
        out.print(json);
    }
}
