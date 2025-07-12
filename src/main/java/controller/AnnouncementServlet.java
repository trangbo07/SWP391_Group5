package controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import dao.AnnouncementDAO;
import dto.AnnouncementDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/announcements")
public class AnnouncementServlet extends HttpServlet {

    private AnnouncementDAO announcementDAO;

    @Override
    public void init() {
        // Có thể lấy từ context hoặc DI tùy dự án
        announcementDAO = new AnnouncementDAO();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        PrintWriter out = resp.getWriter();

        try {
            List<AnnouncementDTO> list = announcementDAO.getLatestAnnouncements();

            Gson gson = new GsonBuilder()
                    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                    .create();

            out.print(gson.toJson(list));
        } catch (Exception ex) {
            ex.printStackTrace();  // log server‑side
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"message\":\"Server error\"}");
        } finally {
            out.flush();
        }
    }
}
