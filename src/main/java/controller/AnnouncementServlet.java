package controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import dao.AccountDAO;
import dao.AnnouncementDAO;
import dto.AnnouncementDTO;
import dto.AnnouncementReadDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.AccountStaff;
import util.NormalizeUtil;

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
            String action = req.getParameter("action");
            Object user = req.getSession().getAttribute("user");
            int staffId = 0;
            if (user != null && user instanceof AccountStaff) {
                staffId = ((AccountStaff) user).getAccountStaffId();
            }

            Gson gson = new GsonBuilder()
                    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                    .create();

            if ("filter".equalsIgnoreCase(action)) {
                String status = req.getParameter("status");
                String search = NormalizeUtil.normalizeKeyword(req.getParameter("search"));

                List<AnnouncementReadDTO> filteredAnnouncements = announcementDAO.filterAnnouncements(
                        staffId, status, search
                );

                out.print(gson.toJson(filteredAnnouncements));

            } else {
                List<AnnouncementReadDTO> list = announcementDAO.getLatestAnnouncements(staffId);
                out.print(gson.toJson(list));
            }

        } catch (Exception ex) {
            ex.printStackTrace();  // log server‑side
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"message\":\"Server error\"}");
        } finally {
            out.flush();
        }
    }


    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String action = req.getParameter("action");
        if ("markRead".equals(action)) {
            try {
                int annId  = Integer.parseInt(req.getParameter("id"));
                int userId = ((AccountStaff) req.getSession().getAttribute("user")).getAccount_staff_id();

                announcementDAO.markAsRead(annId, userId);

                resp.setContentType("application/json");
                resp.getWriter().write("{\"success\":true}");
            } catch (Exception ex) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"success\":false}");
            }
            return;
        }

        if ("mark-all-read".equals(action)) {
            try {
                int userId = ((AccountStaff) req.getSession().getAttribute("user")).getAccount_staff_id();

                announcementDAO.markAllAsRead(userId);

                resp.setContentType("application/json");
                resp.getWriter().write("{\"success\":true}");
            } catch (Exception ex) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"success\":false}");
            }
            return;
        }
    }
}
