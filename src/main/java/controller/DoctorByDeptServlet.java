package controller;

import com.google.gson.Gson;
import dao.DepartmentWithScheduleDAO;
import dto.DoctorScheduleDepartDTO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
@WebServlet("/doctors-by-dept")
public class DoctorByDeptServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String dept = request.getParameter("dept");
        response.setContentType("application/json;charset=UTF-8");
        try {
            DepartmentWithScheduleDAO dao = new DepartmentWithScheduleDAO();
            List<DoctorScheduleDepartDTO> doctors = dao.getDoctorsByDepartment(dept);
            System.out.println(doctors);
            String json = new Gson().toJson(doctors);

            response.getWriter().write(json);
        } catch (Exception e) {
            response.setStatus(500);
            response.getWriter().write("{\"error\": \"Lỗi khi lấy dữ liệu bác sĩ.\"}");
        }
    }
}
