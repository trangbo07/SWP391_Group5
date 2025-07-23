package controller;

import com.google.gson.Gson;
import dao.SystemLogPharmacistDAO;
import dto.PharmacistLogDTO;
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

@WebServlet("/api/systemlogs/pharmacist")
public class PharmacistLogServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Gson gson = new Gson();
    private SystemLogPharmacistDAO pharmacistLogDAO = new SystemLogPharmacistDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if ("distinct".equals(action)) {
            String field = request.getParameter("field");
            if ("action_type".equals(field)) {
                try {
                    List<String> actionTypes = pharmacistLogDAO.getDistinctActionTypes();
                    out.print(gson.toJson(actionTypes));
                } catch (SQLException e) {
                    e.printStackTrace();
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    response.getWriter().write(gson.toJson(new JsonResponse(false, "Lỗi khi tải các loại hành động: " + e.getMessage())));
                }
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write(gson.toJson(new JsonResponse(false, "Tham số 'field' không hợp lệ.")));
            }
        } else {
            // Logic lấy danh sách log
            String searchTerm = request.getParameter("search");
            String actionType = request.getParameter("actionType");

            try {
                List<PharmacistLogDTO> pharmacistLogs = pharmacistLogDAO.getPharmacistLogs(searchTerm, actionType);
                response.getWriter().write(gson.toJson(pharmacistLogs));
            } catch (SQLException e) {
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write(gson.toJson(new JsonResponse(false, "Lỗi khi tải nhật ký dược sĩ: " + e.getMessage())));
            }
        }
    }
}