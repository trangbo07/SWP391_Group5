package controller;

import com.google.gson.Gson;
import dao.DoctorFeedBackDAO;

import dto.TopFeedbackDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/doctor-feedback-top10")
public class DoctorFeedBackServlet extends HttpServlet {
    private final DoctorFeedBackDAO feedbackDAO = new DoctorFeedBackDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        PrintWriter out = resp.getWriter();

        try {
            List<TopFeedbackDTO> top10Doctors = feedbackDAO.getTop10DoctorFeedback();
            System.out.println(" day roi" + top10Doctors);
            if (top10Doctors == null || top10Doctors.isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
                out.print("{\"message\": \"Không có dữ liệu phản hồi nào.\"}");
            } else {
                String json = gson.toJson(top10Doctors);
                out.print(json);
            }

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\": \"Đã xảy ra lỗi khi lấy phản hồi bác sĩ.\"}");
        }

        out.flush();
    }
}
