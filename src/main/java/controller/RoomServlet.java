package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.RoomDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.Room;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/rooms/available")
public class RoomServlet extends HttpServlet {
    private final RoomDAO roomDAO = new RoomDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        List<Room> rooms = roomDAO.getAvailableRooms();
        resp.setContentType("application/json");
        mapper.writeValue(resp.getWriter(), rooms);
    }
} 