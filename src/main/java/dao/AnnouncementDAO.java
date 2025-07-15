package dao;

import dto.AnnouncementDTO;
import dto.AnnouncementReadDTO;

import java.sql.*;
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

    public int createAnnouncement(String title, String content, int adminId) {
        String sql = """
        INSERT INTO InternalAnnouncement (title, content, created_at, created_by_admin)
        VALUES (?, ?, GETDATE(), ?)
    """;

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, title);
            ps.setString(2, content);
            ps.setInt(3, adminId);

            int affectedRows = ps.executeUpdate();

            if (affectedRows == 0) return -1;

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                } else {
                    return -1;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
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

    public List<AnnouncementReadDTO> getLatestAnnouncements(int accountStaffId) {
        List<AnnouncementReadDTO> announcements = new ArrayList<>();

        try {
            String sql = """
            SELECT a.announcement_id, a.title, a.content,
                   a.created_at, a.created_by_admin,
                   s.full_name, s.department, s.phone, s.account_staff_id,
                   CASE WHEN ar.announcement_id IS NOT NULL THEN 1 ELSE 0 END AS is_read
            FROM InternalAnnouncement a
            JOIN Admin s ON a.created_by_admin = s.admin_id
            LEFT JOIN AnnouncementRead ar\s
                ON a.announcement_id = ar.announcement_id AND ar.account_staff_id = ?
            ORDER BY is_read ASC, a.created_at DESC
        """;

            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, accountStaffId);

            ResultSet rs = statement.executeQuery();

            while (rs.next()) {
                AnnouncementReadDTO announcement = new AnnouncementReadDTO(
                        rs.getInt("announcement_id"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getTimestamp("created_at").toString(),
                        rs.getInt("created_by_admin"),
                        rs.getString("full_name"),
                        rs.getString("department"),
                        rs.getString("phone"),
                        rs.getInt("account_staff_id"),
                        rs.getBoolean("is_read")
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

    public void markAsRead(int annId, int staffId) throws SQLException {
        String sql = "INSERT INTO AnnouncementRead (announcement_id, account_staff_id) VALUES (?, ?)";

        try (Connection con = db.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, annId);
            ps.setInt(2, staffId);
            ps.executeUpdate();
        } catch (SQLIntegrityConstraintViolationException ex) {
        }
    }

    public List<AnnouncementReadDTO> filterAnnouncements(int staffId, String status, String search) {
        List<AnnouncementReadDTO> result = new ArrayList<>();

        StringBuilder sql = new StringBuilder("""
                SELECT a.announcement_id, a.title, a.content,
                       a.created_at, a.created_by_admin,
                       s.full_name, s.department, s.phone, s.account_staff_id,
                       CASE WHEN ars.announcement_id IS NOT NULL THEN 1 ELSE 0 END AS is_read
                FROM InternalAnnouncement a
                JOIN Admin s ON a.created_by_admin = s.admin_id
                LEFT JOIN AnnouncementRead ars
                    ON a.announcement_id = ars.announcement_id AND ars.account_staff_id = ?
                WHERE 1=1
            """);

        List<Object> params = new ArrayList<>();
        params.add(staffId);

        if (status != null && !status.trim().isEmpty() && !status.trim().equalsIgnoreCase("All")) {
            status = status.trim();
            if ("Read".equalsIgnoreCase(status)) {
                sql.append(" AND ars.announcement_id IS NOT NULL");
            } else if ("Unread".equalsIgnoreCase(status)) {
                sql.append(" AND ars.announcement_id IS NULL");
            }
        }

        if (search != null && !search.isEmpty()) {
            sql.append("""
                         AND (
                            a.title COLLATE Latin1_General_CI_AI LIKE ? OR
                            a.content COLLATE Latin1_General_CI_AI LIKE ?
                        )
                        """);
            String keyword = "%" + search.trim().replaceAll("\\s+", " ") + "%";
            params.add(keyword);
            params.add(keyword);
        }

        sql.append(" ORDER BY is_read ASC, a.created_at DESC");

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    AnnouncementReadDTO announcement = new AnnouncementReadDTO(
                            rs.getInt("announcement_id"),
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getTimestamp("created_at").toString(),
                            rs.getInt("created_by_admin"),
                            rs.getString("full_name"),
                            rs.getString("department"),
                            rs.getString("phone"),
                            rs.getInt("account_staff_id"),
                            rs.getBoolean("is_read")
                    );
                    result.add(announcement);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }

    public void markAllAsRead(int staffId) throws SQLException {
        String sql = """
        INSERT INTO AnnouncementRead (announcement_id, account_staff_id)
        SELECT ia.announcement_id, ?
        FROM InternalAnnouncement ia
        WHERE NOT EXISTS (
            SELECT 1
            FROM AnnouncementRead ar
            WHERE ar.announcement_id = ia.announcement_id
              AND ar.account_staff_id = ?
        )
    """;

        try (Connection con = db.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, staffId);
            ps.setInt(2, staffId);
            ps.executeUpdate();
        }
    }

}
