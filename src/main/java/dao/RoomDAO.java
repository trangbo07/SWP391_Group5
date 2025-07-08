package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import model.Room;

public class RoomDAO {
    public List<Room> getAvailableRooms() {
        List<Room> rooms = new ArrayList<>();
        String sql = "SELECT room_id, room_name FROM Room WHERE status = 'Available'";
        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Room room = new Room();
                room.setRoomId(rs.getInt("room_id"));
                room.setRoomName(rs.getString("room_name"));
                rooms.add(room);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return rooms;
    }
} 