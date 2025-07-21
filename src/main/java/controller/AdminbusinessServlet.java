package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.Map;
import dao.AdminbusinessDAO;
import dto.ScheduleDTO;


@WebServlet({"/api/schedule/check", "/api/schedule/create"})
public class AdminbusinessServlet extends HttpServlet {
    private final ObjectMapper mapper = new ObjectMapper();
    private final AdminbusinessDAO dao = new AdminbusinessDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if ("/api/schedule/check".equals(req.getServletPath())) {
            int doctorId = Integer.parseInt(req.getParameter("doctorId"));
            String date = req.getParameter("workingDate");
            String shift = req.getParameter("shift");

            boolean exists = dao.checkScheduleDuplicate(doctorId, date, shift);
            resp.setContentType("application/json");
            mapper.writeValue(resp.getWriter(), Map.of("exists", exists));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if ("/api/schedule/create".equals(req.getServletPath())) {
            try {
                String body = req.getReader().lines().reduce("", (acc, line) -> acc + line);
                System.out.println("Body JSON nhận được: " + body);

                ScheduleDTO dto = mapper.readValue(body, ScheduleDTO.class);

                HttpSession session = req.getSession();
                Integer accountStaffId = (Integer) session.getAttribute("adminBusinessId");
                System.out.println("Session accountStaffId = " + accountStaffId);

                Integer adminId = dao.getAdminIdByAccountStaffId(accountStaffId);
                System.out.println("AdminId tương ứng = " + adminId);

                if (adminId == null) {
                    resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    mapper.writeValue(resp.getWriter(), Map.of("success", false, "message", "Bạn chưa đăng nhập hoặc không tìm thấy admin tương ứng"));
                    return;
                }

                boolean success = dao.insertSchedule(
                        dto.getDoctorId(),
                        dto.getWorkingDate(),
                        dto.getShift(),
                        dto.getRoomId(),
                        dto.getNote(),
                        adminId
                );

                resp.setContentType("application/json");
                mapper.writeValue(resp.getWriter(), Map.of("success", success));
            } catch (Exception e) {
                e.printStackTrace(); // 👈 In lỗi chi tiết
                resp.setStatus(500);
                resp.getWriter().write("Lỗi server: " + e.getMessage());
            }
        }
    }
}
