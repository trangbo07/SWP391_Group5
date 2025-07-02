package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import dao.ListOfMedicalServiceDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.ListOfMedicalService;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

@WebServlet("/services")
public class ServiceServlet extends HttpServlet {
    private ListOfMedicalServiceDAO serviceDAO;
    private ObjectMapper objectMapper;

    @Override
    public void init() throws ServletException {
        serviceDAO = new ListOfMedicalServiceDAO();
        objectMapper = new ObjectMapper();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String action = request.getParameter("action");
        
        if ("api".equals(action)) {
            handleGetApiRequest(request, response);
        } else {
            // Forward to the services page
            request.getRequestDispatcher("/view/services.html").forward(request, response);
        }
    }

    private void handleGetApiRequest(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try {
            String serviceId = request.getParameter("id");
            String searchQuery = request.getParameter("search");

            if (serviceId != null && !serviceId.isEmpty()) {
                // Get single service by ID
                int id = Integer.parseInt(serviceId);
                ListOfMedicalService service = serviceDAO.getServiceById(id);
                if (service != null) {
                    String jsonResponse = objectMapper.writeValueAsString(service);
                    response.getWriter().write(jsonResponse);
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\": \"Service not found\"}");
                }
            } else if (searchQuery != null && !searchQuery.trim().isEmpty()) {
                // Search services by name
                List<ListOfMedicalService> services = serviceDAO.searchServicesByName(searchQuery.trim());
                String jsonResponse = objectMapper.writeValueAsString(services);
                response.getWriter().write(jsonResponse);
            } else {
                // Get all services
                List<ListOfMedicalService> services = serviceDAO.getAllServices();
                String jsonResponse = objectMapper.writeValueAsString(services);
                response.getWriter().write(jsonResponse);
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid service ID format\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Failed to fetch services: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String action = request.getParameter("action");
        
        try {
            if ("add".equals(action)) {
                handleAddService(request, response);
            } else if ("update".equals(action)) {
                handleUpdateService(request, response);
            } else if ("delete".equals(action)) {
                handleDeleteService(request, response);
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Invalid action specified\"}");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Operation failed: " + e.getMessage() + "\"}");
        }
    }

    private void handleAddService(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        
        try {
            JsonNode jsonNode = objectMapper.readTree(sb.toString());
            
            String name = jsonNode.get("name").asText().trim();
            String description = jsonNode.get("description").asText().trim();
            double price = jsonNode.get("price").asDouble();
            
            // Validation
            if (name.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Service name is required\"}");
                return;
            }
            
            if (price <= 0) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Price must be greater than 0\"}");
                return;
            }
            
            // Check if service name already exists
            if (serviceDAO.serviceExists(name)) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                response.getWriter().write("{\"error\": \"Service name already exists\"}");
                return;
            }
            
            ListOfMedicalService service = new ListOfMedicalService(0, name, description, price);
            
            if (serviceDAO.addService(service)) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                response.getWriter().write("{\"success\": true, \"message\": \"Service added successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Failed to add service\"}");
            }
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid JSON data: " + e.getMessage() + "\"}");
        }
    }

    private void handleUpdateService(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        
        try {
            JsonNode jsonNode = objectMapper.readTree(sb.toString());
            
            int serviceId = jsonNode.get("service_id").asInt();
            String name = jsonNode.get("name").asText().trim();
            String description = jsonNode.get("description").asText().trim();
            double price = jsonNode.get("price").asDouble();
            
            // Validation
            if (name.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Service name is required\"}");
                return;
            }
            
            if (price <= 0) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Price must be greater than 0\"}");
                return;
            }
            
            // Check if service exists
            if (serviceDAO.getServiceById(serviceId) == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Service not found\"}");
                return;
            }
            
            // Check if service name already exists (excluding current service)
            if (serviceDAO.serviceExistsExcludeId(name, serviceId)) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                response.getWriter().write("{\"error\": \"Service name already exists\"}");
                return;
            }
            
            ListOfMedicalService service = new ListOfMedicalService(serviceId, name, description, price);
            
            if (serviceDAO.updateService(service)) {
                response.getWriter().write("{\"success\": true, \"message\": \"Service updated successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Failed to update service\"}");
            }
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid JSON data: " + e.getMessage() + "\"}");
        }
    }

    private void handleDeleteService(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        try {
            String serviceIdParam = request.getParameter("id");
            
            if (serviceIdParam == null || serviceIdParam.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Service ID is required\"}");
                return;
            }
            
            int serviceId = Integer.parseInt(serviceIdParam);
            
            // Check if service exists
            if (serviceDAO.getServiceById(serviceId) == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Service not found\"}");
                return;
            }
            
            if (serviceDAO.deleteService(serviceId)) {
                response.getWriter().write("{\"success\": true, \"message\": \"Service deleted successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Failed to delete service\"}");
            }
            
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid service ID format\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Delete operation failed: " + e.getMessage() + "\"}");
        }
    }
} 