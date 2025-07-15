// src/main/java/socket/AnnouncementSocket.java
package socket;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import dao.AnnouncementDAO;
import dto.AnnouncementDTO;
import dto.AnnouncementReadDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import model.AccountStaff;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/ws/announcements")
public class AnnouncementSocket {

    private static final Set<Session> SESSIONS =
            Collections.newSetFromMap(new ConcurrentHashMap<>());

    private static final Gson GSON = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            .create();

    /* ------------------- Life‑cycle ------------------- */

    @OnOpen
    public void onOpen(Session session) throws IOException {
        SESSIONS.add(session);

        // Lấy tham số staffId từ query params
        Map<String, List<String>> params = session.getRequestParameterMap();
        int staffId = 0;
        if (params.containsKey("staffId")) {
            try {
                staffId = Integer.parseInt(params.get("staffId").get(0));
            } catch (NumberFormatException e) {
                staffId = 0;
            }
        }

        AnnouncementDAO announcementDAO = new AnnouncementDAO();

        List<AnnouncementReadDTO> list = announcementDAO.getLatestAnnouncements(staffId);
        String payload = GSON.toJson(Map.of("type", "full", "data", list));
        session.getBasicRemote().sendText(payload);
    }


    @OnClose
    public void onClose(Session session) {
        SESSIONS.remove(session);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        throwable.printStackTrace();
    }

    /* ------------------- Broadcast tiện ích ------------------- */

    public static void broadcastNewAnnouncement(AnnouncementDTO dto) {
        String payload = GSON.toJson(Map.of("type", "new", "data", dto));
        SESSIONS.forEach(sess -> {
            try {
                sess.getBasicRemote().sendText(payload);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    public static void broadcastDeleteAnnouncement(long announcementId) {
        String payload = GSON.toJson(Map.of(
                "type", "delete",
                "id",   announcementId
        ));
        SESSIONS.forEach(sess -> sess.getAsyncRemote().sendText(payload));
    }
}
