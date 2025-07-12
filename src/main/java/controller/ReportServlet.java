package controller;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import dao.ReportDAO;

@WebServlet("/reports")
public class ReportServlet extends HttpServlet {
    private ReportDAO reportDAO;
    private Gson gson;

    public void init() throws ServletException {
        reportDAO = new ReportDAO();
        gson = new Gson();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String reportType = request.getParameter("type");
        
        try {
            Object reportData = null;
            switch (reportType) {
                case "revenue":
                    reportData = reportDAO.getTotalRevenueReport();
                    break;
                case "services":
                    reportData = reportDAO.getServiceUsageReport();
                    break;
                case "patients":
                    reportData = reportDAO.getPatientVisitReport();
                    break;
                case "medicines":
                    reportData = reportDAO.getMedicineInventoryReport();
                    break;
                default:
                    response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid report type");
                    return;
            }

            // Convert to JSON and send response
            String jsonResponse = gson.toJson(reportData);
            response.getWriter().write(jsonResponse);
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Error generating report: " + e.getMessage());
        }
    }
} 