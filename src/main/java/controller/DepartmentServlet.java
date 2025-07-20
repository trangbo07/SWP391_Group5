package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.DepartmentDAO;
import dao.DiagnosisDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/departments")
public class DepartmentServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");

        try {
            DepartmentDAO dao = new DepartmentDAO();
            List<String> departments = dao.getAllDepartments();
            System.out.println(departments);
            ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(response.getWriter(), departments);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}