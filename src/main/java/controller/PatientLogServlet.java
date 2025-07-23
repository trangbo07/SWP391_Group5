package controller;

import com.google.gson.Gson;
import dao.SystemLogPatientDAO;
import dto.PatientLogDTO;
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

@WebServlet("/api/systemlogs/patient")
public class PatientLogServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Gson gson = new Gson();
    private SystemLogPatientDAO patientLogDAO = new SystemLogPatientDAO();

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
                    List<String> actionTypes = patientLogDAO.getDistinctActionTypes();
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
            String searchTerm = request.getParameter("search");
            String actionType = request.getParameter("actionType");

            try {
                List<PatientLogDTO> patientLogs = patientLogDAO.getPatientLogs(searchTerm, actionType);
                response.getWriter().write(gson.toJson(patientLogs));
            } catch (SQLException e) {
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write(gson.toJson(new JsonResponse(false, "Lỗi khi tải nhật ký bệnh nhân: " + e.getMessage())));
            }
        }
    }
}