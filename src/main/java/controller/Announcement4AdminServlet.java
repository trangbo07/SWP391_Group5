package controller;

import com.google.gson.Gson;
import dao.AccountStaffDAO;
import dao.AnnouncementDAO;
import dto.AnnouncementDTO;
import dto.JsonResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountStaff;
import model.AdminBusiness;
import model.AdminSystem;
import socket.AnnouncementSocket;
import util.NormalizeUtil;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@MultipartConfig(
        fileSizeThreshold = 1024 * 1024,  // 1MB
        maxFileSize = 5 * 1024 * 1024,    // 5MB
        maxRequestSize = 10 * 1024 * 1024 // 10MB
)
@WebServlet("/api/admin/announcements")
public class Announcement4AdminServlet extends HttpServlet {
    private final AnnouncementDAO dao = new AnnouncementDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            String action = req.getParameter("action");
            if (action == null) action = "";

            switch (action) {
                case "filter" -> {
                    String keyword = req.getParameter("search");
                    String status = req.getParameter("status");

                    HttpSession session = req.getSession(false);
                    int adminId = 0;

                    if ("me".equalsIgnoreCase(status)) {
                        adminId = getAdminIdFromSession(req.getSession(false));
                    } else {
                        adminId = 0;
                    }

                    keyword = NormalizeUtil.normalizeKeyword(keyword);

                    List<AnnouncementDTO> filtered = dao.filterAnnouncements(adminId, keyword);
                    out.print(gson.toJson(filtered));
                }

                default -> {
                    List<AnnouncementDTO> list = dao.getAllAnnouncements();
                    out.print(gson.toJson(list));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.print(gson.toJson(new JsonResponse(false, "Server error")));
        }
    }



    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            String action = req.getParameter("action");
            JsonResponse res;

            switch (action) {
                case "create" -> {
                    String title = req.getParameter("title");
                    String content = req.getParameter("content");

                    HttpSession session = req.getSession(false);
                    int adminId = 0;
                    adminId = getAdminIdFromSession(req.getSession(false));

                    int newId = dao.createAnnouncement(title, content, adminId);
                    boolean success = newId > 0;

                    if (success) {
                        AnnouncementDTO dto = dao.getAnnouncementByAnnouncementId(newId);
                        AnnouncementSocket.broadcastNewAnnouncement(dto);
                    }

                    res = new JsonResponse(success, success ? "Created successfully" : "Create failed");
                    out.print(gson.toJson(res));
                }

                case "update" -> {
                    int id = Integer.parseInt(req.getParameter("announcementId"));
                    String title = req.getParameter("title");
                    String content = req.getParameter("content");

                    boolean success = dao.updateAnnouncement(id, title, content);

                    if (success) {
                        AnnouncementDTO dto = dao.getAnnouncementByAnnouncementId(id);
                        AnnouncementSocket.broadcastNewAnnouncement(dto);
                    }

                    res = new JsonResponse(success, success ? "Updated successfully" : "Update failed");
                    out.print(gson.toJson(res));
                }

                case "delete" -> {
                    int id = Integer.parseInt(req.getParameter("announcement_id"));
                    boolean success = dao.deleteAnnouncement(id);

                    if (success) {
                        AnnouncementDTO dto = new AnnouncementDTO();
                        dto.setAnnouncementId(id);
                        AnnouncementSocket.broadcastDeleteAnnouncement(id);
                    }

                    res = new JsonResponse(success, success ? "Deleted successfully" : "Delete failed");
                    out.print(gson.toJson(res));
                }

                default -> {
                    res = new JsonResponse(false, "Invalid action");
                    out.print(gson.toJson(res));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print(gson.toJson(new JsonResponse(false, "Server error: " + e.getMessage())));
        }
    }

    private int getAdminIdFromSession(HttpSession session) {
        if (session == null) return 0;

        Object user = session.getAttribute("user");
        if (!(user instanceof AccountStaff staff)) return 0;

        AccountStaffDAO daoStaff = new AccountStaffDAO();

        Object adminObj = daoStaff.getOStaffByStaffId(staff.getAccountStaffId(), "AdminSystem");
        if (adminObj instanceof AdminSystem adminSys) {
            return adminSys.getAdmin_id();
        }

        adminObj = daoStaff.getOStaffByStaffId(staff.getAccountStaffId(), "AdminBusiness");
        if (adminObj instanceof AdminBusiness adminBiz) {
            return adminBiz.getAdmin_id();
        }

        return 0;
    }

}
