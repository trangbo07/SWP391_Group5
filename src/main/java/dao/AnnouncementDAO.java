package dao;

import dto.AnnouncementDTO;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class AnnouncementDAO {
   DBContext db = dao.DBContext.getInstance();

    public List<AnnouncementDTO> getAllAnnouncements() {
        List<AnnouncementDTO> announcements = new ArrayList<>();

        try {
            String sql = """
                SELECT a.announcement_id, a.title, a.content, a.created_at, a.created_by_admin,
                s.full_name, s.department, s.phone, s.account_staff_id
                FROM InternalAnnouncement a
                JOIN Admin s ON a.created_by_admin = s.admin_id
                ORDER BY a.created_at DESC;
            """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            ResultSet rs = statement.executeQuery();

            while (rs.next()) {
                AnnouncementDTO announcement = new AnnouncementDTO(
                        rs.getInt("announcement_id"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getString("created_at"),
                        rs.getInt("created_by_admin"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone"),
                        rs.getInt("account_staff_id")
                );
                announcements.add(announcement);
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return announcements.isEmpty() ? null : announcements;
    }

    public boolean createAnnouncement(String title, String content, int adminId) {
        String sql = """
            INSERT INTO InternalAnnouncement (title, content, created_at, created_by_admin)
            VALUES (?, ?, GETDATE(), ?)
        """;

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, title);
            ps.setString(2, content);
            ps.setInt(3, adminId);
            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteAnnouncement(int announcementId) {
        String sql = "DELETE FROM InternalAnnouncement WHERE announcement_id = ?";

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, announcementId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<AnnouncementDTO> filterAnnouncements(Integer adminId, String keyword) {
        List<AnnouncementDTO> announcements = new ArrayList<>();

        try {
            StringBuilder sql = new StringBuilder("""
            SELECT a.announcement_id, a.title, a.content, a.created_at, a.created_by_admin,
                   s.full_name, s.department, s.phone, s.account_staff_id
            FROM InternalAnnouncement a
            JOIN Admin s ON a.created_by_admin = s.admin_id
            WHERE 1=1
        """);

            List<Object> params = new ArrayList<>();

            // Nếu truyền adminId > 0 thì lọc theo admin
            if (adminId != null && adminId > 0) {
                sql.append(" AND a.created_by_admin = ?");
                params.add(adminId);
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                sql.append("""
                AND (
                    a.title COLLATE Latin1_General_CI_AI LIKE ? OR
                    a.content COLLATE Latin1_General_CI_AI LIKE ?
                )
            """);
                String kw = "%" + keyword.trim().replaceAll("\\s+", " ") + "%";
                params.add(kw);
                params.add(kw);
            }

            sql.append(" ORDER BY a.created_at DESC");

            PreparedStatement statement = db.getConnection().prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                statement.setObject(i + 1, params.get(i));
            }

            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                AnnouncementDTO announcement = new AnnouncementDTO(
                        rs.getInt("announcement_id"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getString("created_at"),
                        rs.getInt("created_by_admin"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone"),
                        rs.getInt("account_staff_id")
                );
                announcements.add(announcement);
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return announcements;
    }


    public AnnouncementDTO getAnnouncementByAnnouncementId(int id) {
        AnnouncementDTO announcement = null;

        try {
            String sql = """
                SELECT a.*, s.full_name, s.department, s.phone, s.account_staff_id
                FROM InternalAnnouncement a
                JOIN Admin s ON a.created_by_admin = s.admin_id
                WHERE a.announcement_id = ?
            """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();

            if (rs.next()) {
                announcement = new AnnouncementDTO(
                        rs.getInt("announcement_id"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getString("created_at"),
                        rs.getInt("created_by_admin"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone"),
                        rs.getInt("account_staff_id")
                );
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return announcement;
    }

    public AnnouncementDTO getAnnouncementByAdminId(int id) {
        AnnouncementDTO announcement = null;

        try {
            String sql = """
                        SELECT a.*, s.full_name, s.department, s.phone, s.account_staff_id
                        FROM InternalAnnouncement a
                        JOIN Admin s ON a.created_by_admin = s.admin_id
                        WHERE a.created_by_admin = ?
                    """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();

            if (rs.next()) {
                announcement = new AnnouncementDTO(
                        rs.getInt("announcement_id"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getString("created_at"),
                        rs.getInt("created_by_admin"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone"),
                        rs.getInt("account_staff_id")
                );
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return announcement;
    }

    public boolean updateAnnouncement(int id, String title, String content) {
        DBContext db = DBContext.getInstance();
        String sql = "UPDATE InternalAnnouncement SET title = ?, content = ? WHERE announcement_id = ?";

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, title);
            ps.setString(2, content);
            ps.setInt(3, id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}
