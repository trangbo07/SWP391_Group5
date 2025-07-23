package controller;

import com.google.gson.Gson;
import dao.SystemLogStaffDAO;
import dto.StaffLogDTO;
import dto.JsonResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;

@WebServlet("/api/systemlogs/staff")
public class StaffLogServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Gson gson = new Gson();
    private SystemLogStaffDAO staffLogDAO = new SystemLogStaffDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if ("distinct".equals(action)) {
            String field = request.getParameter("field");
            try {
                if ("action_type".equals(field)) {
                    List<String> actionTypes = staffLogDAO.getDistinctActionTypes();
                    out.print(gson.toJson(actionTypes));
                } else if ("role".equals(field)) { // Thêm điều kiện cho vai trò
                    List<String> roles = staffLogDAO.getDistinctRoles();
                    out.print(gson.toJson(roles));
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write(gson.toJson(new JsonResponse(false, "Tham số 'field' không hợp lệ.")));
                }
            } catch (SQLException e) {
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write(gson.toJson(new JsonResponse(false, "Lỗi khi tải các loại dữ liệu: " + e.getMessage())));
            }
        } else {
            // Logic lấy danh sách log
            String searchTerm = request.getParameter("search");
            String actionType = request.getParameter("actionType");
            String role = request.getParameter("role"); // Lấy tham số role từ request

            try {
                List<StaffLogDTO> staffLogs = staffLogDAO.getStaffLogs(searchTerm, actionType, role); // Truyền thêm role
                response.getWriter().write(gson.toJson(staffLogs));
            } catch (SQLException e) {
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write(gson.toJson(new JsonResponse(false, "Lỗi khi tải nhật ký nhân viên: " + e.getMessage())));
            }
        }
    }
}