package controller;

import com.google.gson.Gson;
import dao.AccountStaffDAO;
import dao.AnnouncementDAO;
import dto.AnnouncementDTO;
import dto.JsonResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountStaff;
import model.AdminSystem;
import util.NormalizeUtil;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

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
                        if (session != null && session.getAttribute("account_staff_id") != null) {
                            int accountStaffId = ((AccountStaff)session.getAttribute("user")).getAccountStaffId();
                            System.out.println(accountStaffId);
                            AccountStaffDAO daoStaff = new AccountStaffDAO();
                            Object adminObj = daoStaff.getOStaffByStaffId(accountStaffId, "AdminSys");

                            if (adminObj instanceof AdminSystem) {
                                AdminSystem admin = (AdminSystem) adminObj;
                                adminId = admin.getAdmin_id();
                            }
                        }
                    } else {
                        adminId = 0;
                    }
                    System.out.println(adminId);

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
                    Integer adminId = (session != null && session.getAttribute("userId") != null)
                            ? (Integer) session.getAttribute("userId")
                            : null;

                    if (adminId == null) {
                        out.print(gson.toJson(new JsonResponse(false, "Unauthorized")));
                        return;
                    }

                    boolean success = dao.createAnnouncement(title, content, adminId);
                    res = new JsonResponse(success, success ? "Created successfully" : "Create failed");
                    out.print(gson.toJson(res));
                }

                case "update" -> {
                    int id = Integer.parseInt(req.getParameter("announcement_id"));
                    String title = req.getParameter("title");
                    String content = req.getParameter("content");

                    boolean success = dao.updateAnnouncement(id, title, content);
                    res = new JsonResponse(success, success ? "Updated successfully" : "Update failed");
                    out.print(gson.toJson(res));
                }

                case "delete" -> {
                    int id = Integer.parseInt(req.getParameter("announcement_id"));
                    boolean success = dao.deleteAnnouncement(id);
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
}
