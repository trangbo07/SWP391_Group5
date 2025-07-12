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
import jakarta.servlet.http.HttpSession;

import com.google.gson.Gson;

import dao.ReportDAO;
import dto.JsonResponse;

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

        // Check authentication
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            JsonResponse res = new JsonResponse(false, "Unauthorized", "/view/home.html");
            response.getWriter().write(gson.toJson(res));
            return;
        }

        String reportType = request.getParameter("type");
        String startDate = request.getParameter("startDate");
        String endDate = request.getParameter("endDate");
        String yearParam = request.getParameter("year");
        
        try {
            Object reportData = null;
            
            switch (reportType != null ? reportType : "") {
                case "revenue":
                    reportData = reportDAO.getTotalRevenueReport(startDate, endDate);
                    break;
                    
                case "services":
                    reportData = reportDAO.getServiceUsageReport(startDate, endDate);
                    break;
                    
                case "patients":
                    reportData = reportDAO.getPatientVisitReport(startDate, endDate);
                    break;
                    
                case "medicines":
                    reportData = reportDAO.getMedicineInventoryReport();
                    break;
                    
                case "doctors":
                    reportData = reportDAO.getDoctorPerformanceReport(startDate, endDate);
                    break;
                    
                case "departments":
                    reportData = reportDAO.getDepartmentPerformanceReport(startDate, endDate);
                    break;
                    
                case "monthly-trend":
                    int year = yearParam != null ? Integer.parseInt(yearParam) : java.time.Year.now().getValue();
                    reportData = reportDAO.getMonthlyRevenueTrend(year);
                    break;
                    
                case "financial-summary":
                    reportData = reportDAO.getFinancialSummary(startDate, endDate);
                    break;
                    
                case "dashboard":
                    // Return comprehensive dashboard data
                    Map<String, Object> dashboardData = new java.util.HashMap<>();
                    dashboardData.put("revenue", reportDAO.getTotalRevenueReport(startDate, endDate));
                    dashboardData.put("patients", reportDAO.getPatientVisitReport(startDate, endDate));
                    dashboardData.put("topServices", reportDAO.getServiceUsageReport(startDate, endDate));
                    dashboardData.put("departments", reportDAO.getDepartmentPerformanceReport(startDate, endDate));
                    dashboardData.put("medicines", reportDAO.getMedicineInventoryReport());
                    
                    if (yearParam != null) {
                        int dashYear = Integer.parseInt(yearParam);
                        dashboardData.put("monthlyTrend", reportDAO.getMonthlyRevenueTrend(dashYear));
                    }
                    
                    reportData = dashboardData;
                    break;
                    
                default:
                    JsonResponse errorResponse = new JsonResponse(false, "Invalid report type: " + reportType, null);
                    response.getWriter().write(gson.toJson(errorResponse));
                    return;
            }

            // Create success response
            JsonResponse successResponse = new JsonResponse(true, "Report generated successfully", null);
            Map<String, Object> responseData = new java.util.HashMap<>();
            responseData.put("success", true);
            responseData.put("message", "Report generated successfully");
            responseData.put("data", reportData);
            responseData.put("timestamp", new java.util.Date());
            
            // Add filter information to response
            if (startDate != null || endDate != null) {
                Map<String, String> filters = new java.util.HashMap<>();
                filters.put("startDate", startDate);
                filters.put("endDate", endDate);
                if (yearParam != null) {
                    filters.put("year", yearParam);
                }
                responseData.put("filters", filters);
            }
            
            response.getWriter().write(gson.toJson(responseData));
            
        } catch (NumberFormatException e) {
            JsonResponse errorResponse = new JsonResponse(false, "Invalid year format: " + yearParam, null);
            response.getWriter().write(gson.toJson(errorResponse));
        } catch (SQLException e) {
            System.err.println("SQL Error in ReportServlet: " + e.getMessage());
            e.printStackTrace();
            JsonResponse errorResponse = new JsonResponse(false, "Error generating report: " + e.getMessage(), null);
            response.getWriter().write(gson.toJson(errorResponse));
        } catch (Exception e) {
            System.err.println("Unexpected error in ReportServlet: " + e.getMessage());
            e.printStackTrace();
            JsonResponse errorResponse = new JsonResponse(false, "Unexpected error occurred", null);
            response.getWriter().write(gson.toJson(errorResponse));
        }
    }
} 