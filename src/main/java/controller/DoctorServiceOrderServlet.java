package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.AccountStaffDAO;
import dao.AccountPatientDAO;
import dao.ListOfMedicalServiceDAO;
import dao.MedicineRecordDAO;
import dao.ServiceOrderDAO;
import dao.ServiceOrderItemDAO;
import dao.WaitlistDAO;
import dto.ServiceOrderDTO;
import dto.ServiceOrderItemDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountStaff;
import model.Doctor;
import model.ListOfMedicalService;
import model.ServiceOrder;
import model.ServiceOrderItem;
import dto.WaitlistDTO;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/doctor/service-order")
public class DoctorServiceOrderServlet extends HttpServlet {

    private final ServiceOrderDAO serviceOrderDAO = new ServiceOrderDAO();
    private final ServiceOrderItemDAO serviceOrderItemDAO = new ServiceOrderItemDAO();
    private final ListOfMedicalServiceDAO medicalServiceDAO = new ListOfMedicalServiceDAO();
    private final MedicineRecordDAO medicineRecordDAO = new MedicineRecordDAO();
    private final AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
    private final AccountPatientDAO accountPatientDAO = new AccountPatientDAO();
    private final WaitlistDAO waitlistDAO = new WaitlistDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> jsonResponse = new HashMap<>();

        try {
            // Kiểm tra session và quyền bác sĩ
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Unauthorized access");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            AccountStaff accountStaff = (AccountStaff) session.getAttribute("user");
            if (!"Doctor".equals(accountStaff.getRole())) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Access denied. Doctor role required.");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            String action = request.getParameter("action");

            if ("getServices".equals(action)) {
                // Lấy danh sách tất cả services
                List<ListOfMedicalService> services = medicalServiceDAO.getAllServices();

                jsonResponse.put("success", true);
                jsonResponse.put("data", services);

            } else if ("getServiceOrder".equals(action)) {
                // Lấy chi tiết service order
                String serviceOrderIdParam = request.getParameter("serviceOrderId");
                if (serviceOrderIdParam == null || serviceOrderIdParam.trim().isEmpty()) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Service order ID is required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                int serviceOrderId = Integer.parseInt(serviceOrderIdParam);

                Map<String, Object> serviceOrderDetails = serviceOrderDAO.getServiceOrderWithDetails(serviceOrderId);

                if (serviceOrderDetails == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Service order not found");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                List<Map<String, Object>> items = serviceOrderItemDAO.getServiceOrderItemsWithDetails(serviceOrderId);

                double totalAmount = items.stream()
                    .mapToDouble(item -> (Double) item.get("service_price"))
                    .sum();

                Map<String, Object> result = new HashMap<>();
                result.put("serviceOrder", serviceOrderDetails);
                result.put("items", items);
                result.put("totalAmount", totalAmount);

                jsonResponse.put("success", true);
                jsonResponse.put("data", result);

            } else if ("getServiceOrdersByMedicineRecord".equals(action)) {
                // Lấy danh sách service orders theo medicine record ID
                String medicineRecordIdParam = request.getParameter("medicineRecordId");
                if (medicineRecordIdParam == null || medicineRecordIdParam.trim().isEmpty()) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Medicine record ID is required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                int medicineRecordId = Integer.parseInt(medicineRecordIdParam);
                List<ServiceOrder> serviceOrders = serviceOrderDAO.getServiceOrdersByMedicineRecordId(medicineRecordId);
                List<Map<String, Object>> serviceOrdersWithDetails = new ArrayList<>();

                for (ServiceOrder serviceOrder : serviceOrders) {
                    Map<String, Object> orderDetails = serviceOrderDAO.getServiceOrderWithDetails(serviceOrder.getService_order_id());
                    if (orderDetails != null) {
                        List<Map<String, Object>> items = serviceOrderItemDAO.getServiceOrderItemsWithDetails(serviceOrder.getService_order_id());

                        // Tính tổng tiền cho order này
                        double totalAmount = 0.0;
                        for (Map<String, Object> item : items) {
                            totalAmount += (Double) item.get("service_price");
                        }

                        orderDetails.put("items", items);
                        orderDetails.put("totalAmount", totalAmount);
                        serviceOrdersWithDetails.add(orderDetails);
                    }
                }

                jsonResponse.put("success", true);
                jsonResponse.put("data", serviceOrdersWithDetails);
                jsonResponse.put("message", "Service orders retrieved successfully");

            } else if ("getServiceOrdersByDoctor".equals(action)) {
                // Lấy danh sách service orders theo doctor ID
                Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
                if (doctor == null) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Failed to get doctor information");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                List<ServiceOrder> serviceOrders = serviceOrderDAO.getServiceOrdersByDoctorId(doctor.getDoctor_id());
                List<Map<String, Object>> serviceOrdersWithDetails = new ArrayList<>();

                for (ServiceOrder serviceOrder : serviceOrders) {
                    Map<String, Object> orderDetails = serviceOrderDAO.getServiceOrderWithDetails(serviceOrder.getService_order_id());
                    if (orderDetails != null) {
                        List<Map<String, Object>> items = serviceOrderItemDAO.getServiceOrderItemsWithDetails(serviceOrder.getService_order_id());

                        // Tính tổng tiền cho order này
                        double totalAmount = 0.0;
                        for (Map<String, Object> item : items) {
                            totalAmount += (Double) item.get("service_price");
                        }

                        orderDetails.put("items", items);
                        orderDetails.put("totalAmount", totalAmount);
                        serviceOrdersWithDetails.add(orderDetails);
                    }
                }

                jsonResponse.put("success", true);
                jsonResponse.put("data", serviceOrdersWithDetails);
                jsonResponse.put("message", "Service orders retrieved successfully");

            } else if ("getAssignedServices".equals(action)) {
                // Lấy danh sách services được giao cho bác sĩ hiện tại
                try {
                    Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
                    if (doctor == null) {
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        jsonResponse.put("success", false);
                        jsonResponse.put("message", "Doctor information not found. Please check your account.");
                        mapper.writeValue(response.getWriter(), jsonResponse);
                        return;
                    }

                    List<Map<String, Object>> assignedServices = serviceOrderItemDAO.getAssignedServicesByDoctorId(doctor.getDoctor_id());

                    jsonResponse.put("success", true);
                    jsonResponse.put("data", assignedServices);
                    jsonResponse.put("message", "Assigned services retrieved successfully");

                } catch (Exception e) {
                    e.printStackTrace();
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Error retrieving assigned services: " + e.getMessage());
                }

            } else if ("getDoctors".equals(action)) {
                // Lấy danh sách tất cả bác sĩ
                List<Doctor> doctors = accountStaffDAO.getAllDoctors();

                jsonResponse.put("success", true);
                jsonResponse.put("data", doctors);

            } else if ("getServiceOrderWaitlist".equals(action)) {
                // Lấy danh sách waitlist có status = InProgress và visittype = Initial cho bác sĩ hiện tại
                Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
                if (doctor == null) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Failed to get doctor information");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                List<WaitlistDTO> serviceOrderWaitlist = waitlistDAO.getServiceOrderWaitlist(doctor.getDoctor_id());

                jsonResponse.put("success", true);
                jsonResponse.put("data", serviceOrderWaitlist);

            } else if ("getServiceOrderDetails".equals(action)) {
                // Lấy chi tiết service order bao gồm cả items và tổng tiền
                String orderIdParam = request.getParameter("orderId");
                if (orderIdParam == null || orderIdParam.trim().isEmpty()) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Order ID is required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                try {
                    int orderId = Integer.parseInt(orderIdParam);

                    // Lấy thông tin service order
                    Map<String, Object> serviceOrderDetails = serviceOrderDAO.getServiceOrderWithDetails(orderId);

                    if (serviceOrderDetails == null) {
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        jsonResponse.put("success", false);
                        jsonResponse.put("message", "Service order not found");
                        mapper.writeValue(response.getWriter(), jsonResponse);
                        return;
                    }

                    // Lấy danh sách items của service order
                    List<Map<String, Object>> items = serviceOrderItemDAO.getServiceOrderItemsWithDetails(orderId);

                    // Tính tổng tiền
                    double totalAmount = 0.0;
                    for (Map<String, Object> item : items) {
                        Object priceObj = item.get("service_price");
                        if (priceObj != null) {
                            totalAmount += Double.parseDouble(priceObj.toString());
                        }
                    }

                    // Tạo response data
                    Map<String, Object> result = new HashMap<>();
                    result.putAll(serviceOrderDetails);
                    result.put("items", items);
                    result.put("totalAmount", totalAmount);
                    result.put("total_amount", totalAmount); // Thêm alias cho frontend

                    jsonResponse.put("success", true);
                    jsonResponse.put("data", result);
                    jsonResponse.put("message", "Service order details retrieved successfully");

                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Invalid order ID format");
                } catch (Exception e) {
                    e.printStackTrace();
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Error retrieving service order details: " + e.getMessage());
                }

            } else if ("getMedicineRecordByPatientId".equals(action)) {
                // Lấy medicine record ID từ patient ID
                String patientIdParam = request.getParameter("patientId");
                if (patientIdParam == null || patientIdParam.trim().isEmpty()) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Patient ID is required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                int patientId = Integer.parseInt(patientIdParam);
                model.MedicineRecords medicineRecord = medicineRecordDAO.getLatestMedicineRecordByPatientId(patientId);

                int medicineRecordId;
                if (medicineRecord == null) {
                    // Tạo medicine record mới nếu chưa có
                    medicineRecordId = medicineRecordDAO.createMedicineRecord(patientId);
                    if (medicineRecordId == -1) {
                        jsonResponse.put("success", false);
                        jsonResponse.put("message", "Failed to create medicine record");
                        mapper.writeValue(response.getWriter(), jsonResponse);
                        return;
                    }
                } else {
                    medicineRecordId = medicineRecord.getMedicineRecord_id();
                }

                jsonResponse.put("success", true);
                jsonResponse.put("data", medicineRecordId);

            } else if ("getServiceOrdersByPatientName".equals(action)) {
                // Lấy service orders theo tên bệnh nhân
                String patientName = request.getParameter("patientName");
                if (patientName == null || patientName.trim().isEmpty()) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Patient name is required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                // Lấy thông tin bác sĩ hiện tại
                Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
                if (doctor == null) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Failed to get doctor information");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                List<Map<String, Object>> serviceOrders = serviceOrderDAO.getServiceOrdersByPatientName(patientName, doctor.getDoctor_id());

                jsonResponse.put("success", true);
                jsonResponse.put("data", serviceOrders);

            } else if ("getPatientFromWaitlist".equals(action)) {
                // Lấy thông tin bệnh nhân từ waitlist
                String waitlistIdParam = request.getParameter("waitlistId");
                if (waitlistIdParam == null || waitlistIdParam.trim().isEmpty()) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Waitlist ID is required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                int waitlistId = Integer.parseInt(waitlistIdParam);
                WaitlistDTO waitlistInfo = waitlistDAO.getWaitlistDetailById(waitlistId);

                if (waitlistInfo == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Patient not found in waitlist");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                jsonResponse.put("success", true);
                jsonResponse.put("data", waitlistInfo);

            } else if ("getPatientInfo".equals(action)) {
                // Lấy thông tin bệnh nhân theo ID
                String patientIdParam = request.getParameter("patientId");
                if (patientIdParam == null || patientIdParam.trim().isEmpty()) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Patient ID is required");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                int patientId = Integer.parseInt(patientIdParam);
                model.Patient patientInfo = accountPatientDAO.getPatientById(patientId);

                if (patientInfo == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Patient not found");
                    mapper.writeValue(response.getWriter(), jsonResponse);
                    return;
                }

                jsonResponse.put("success", true);
                jsonResponse.put("data", patientInfo);

            } else if ("getDoctors".equals(action)) {
                // Lấy danh sách tất cả bác sĩ
                List<Doctor> doctors = accountStaffDAO.getAllDoctors();

                jsonResponse.put("success", true);
                jsonResponse.put("data", doctors);

            } else if ("getServices".equals(action)) {
                // Lấy danh sách tất cả services có sẵn
                try {
                    List<ListOfMedicalService> allServices = medicalServiceDAO.getAllServices();

                    jsonResponse.put("success", true);
                    jsonResponse.put("data", allServices);
                    jsonResponse.put("message", "All services retrieved successfully");

                } catch (Exception e) {
                    e.printStackTrace();
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Error retrieving services: " + e.getMessage());
                }

            } else if ("testConnection".equals(action)) {
                // Test action để kiểm tra connection và doctor info
                try {
                    Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
                    if (doctor == null) {
                        jsonResponse.put("success", false);
                        jsonResponse.put("message", "Doctor not found");
                    } else {
                        jsonResponse.put("success", true);
                        jsonResponse.put("message", "Connection successful");
                        jsonResponse.put("doctor_id", doctor.getDoctor_id());
                        jsonResponse.put("doctor_name", doctor.getFull_name());
                    }
                } catch (Exception e) {
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Test failed: " + e.getMessage());
                }

            } else if ("getAllServiceOrders".equals(action)) {
                // Lấy tất cả service orders (không giới hạn theo doctor)
                try {
                    
                    List<ServiceOrder> allServiceOrders = serviceOrderDAO.getAllServiceOrders();
                    List<Map<String, Object>> serviceOrdersWithDetails = new ArrayList<>();

                    for (ServiceOrder serviceOrder : allServiceOrders) {
                        Map<String, Object> orderDetails = serviceOrderDAO.getServiceOrderWithDetails(serviceOrder.getService_order_id());
                        if (orderDetails != null) {
                            // Lấy items của service order
                            List<Map<String, Object>> items = serviceOrderItemDAO.getServiceOrderItemsWithDetails(serviceOrder.getService_order_id());

                            // Tính tổng tiền cho order này
                            double totalAmount = 0.0;
                            for (Map<String, Object> item : items) {
                                Object priceObj = item.get("service_price");
                                if (priceObj != null) {
                                    totalAmount += Double.parseDouble(priceObj.toString());
                                }
                            }

                            orderDetails.put("items", items);
                            orderDetails.put("totalAmount", totalAmount);
                            orderDetails.put("total_amount", totalAmount); // Alias cho frontend
                            serviceOrdersWithDetails.add(orderDetails);
                        }
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Error retrieving all service orders: " + e.getMessage());
                }

            } else if ("getMyServiceOrders".equals(action)) {
                // Lấy service orders của bác sĩ hiện tại
                try {
                    // Lấy thông tin bác sĩ hiện tại từ session
                    Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
                    if (doctor == null) {
                        jsonResponse.put("success", false);
                        jsonResponse.put("message", "Failed to get doctor information");
                        mapper.writeValue(response.getWriter(), jsonResponse);
                        return;
                    }

                    int doctorId = doctor.getDoctor_id();
                    
                    List<ServiceOrder> myServiceOrders = serviceOrderDAO.getServiceOrdersByDoctorId(doctorId);
                    List<Map<String, Object>> serviceOrdersWithDetails = new ArrayList<>();

                    for (ServiceOrder serviceOrder : myServiceOrders) {
                        Map<String, Object> orderDetails = serviceOrderDAO.getServiceOrderWithDetails(serviceOrder.getService_order_id());
                        if (orderDetails != null) {
                            // Lấy items của service order
                            List<Map<String, Object>> items = serviceOrderItemDAO.getServiceOrderItemsWithDetails(serviceOrder.getService_order_id());

                            // Tính tổng tiền cho order này
                            double totalAmount = 0.0;
                            for (Map<String, Object> item : items) {
                                Object priceObj = item.get("service_price");
                                if (priceObj != null) {
                                    totalAmount += Double.parseDouble(priceObj.toString());
                                }
                            }

                            orderDetails.put("items", items);
                            orderDetails.put("totalAmount", totalAmount);
                            orderDetails.put("total_amount", totalAmount); // Alias cho frontend
                            serviceOrdersWithDetails.add(orderDetails);
                        }
                    }

                    jsonResponse.put("success", true);
                    jsonResponse.put("data", serviceOrdersWithDetails);
                    jsonResponse.put("message", "My service orders retrieved successfully");
                    jsonResponse.put("totalCount", serviceOrdersWithDetails.size());
                    jsonResponse.put("doctorId", doctorId);

                } catch (Exception e) {
                    e.printStackTrace();
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    jsonResponse.put("success", false);
                    jsonResponse.put("message", "Error retrieving my service orders: " + e.getMessage());
                }

            } else {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Invalid action");
            }

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Internal server error: " + e.getMessage());
        }

        mapper.writeValue(response.getWriter(), jsonResponse);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> jsonResponse = new HashMap<>();

        try {
            // Kiểm tra session và quyền bác sĩ
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Unauthorized access");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            AccountStaff accountStaff = (AccountStaff) session.getAttribute("user");
            if (!"Doctor".equals(accountStaff.getRole())) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Access denied. Doctor role required.");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Đọc dữ liệu từ request
            Map<String, Object> requestData = mapper.readValue(request.getReader(), Map.class);

            // Lấy medicineRecordId (có thể là String hoặc Integer tuỳ JSON gửi lên)
            Object medObj = requestData.get("medicineRecordId");
            Integer medicineRecordId = null;
            if (medObj instanceof Integer) {
                medicineRecordId = (Integer) medObj;
            } else if (medObj instanceof String) {
                try {
                    medicineRecordId = Integer.parseInt((String) medObj);
                } catch (NumberFormatException ignored) {}
            }

            // Lấy danh sách services
            List<Map<String, Object>> services = (List<Map<String, Object>>) requestData.get("services");

            // Lấy waitlistId (có thể là String hoặc Integer)
            Object wlObj = requestData.get("waitlistId");
            Integer waitlistId = null;

            if (wlObj instanceof Integer) {
                waitlistId = (Integer) wlObj;
            } else if (wlObj instanceof String && !((String) wlObj).trim().isEmpty()) {
                try {
                    waitlistId = Integer.parseInt((String) wlObj);
                } catch (NumberFormatException e) {
                    System.out.println("Failed to parse waitlistId: " + wlObj);
                }
            } else if (wlObj instanceof Double) {
                // JSON có thể parse số thành Double
                waitlistId = ((Double) wlObj).intValue();
            }

            // Validation
            if (medicineRecordId == null || services == null || services.isEmpty()) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Missing required fields");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Lấy thông tin bác sĩ hiện tại
            Doctor doctor = (Doctor) accountStaffDAO.getOStaffByStaffId(accountStaff.getAccount_staff_id(), "Doctor");
            if (doctor == null) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Failed to get doctor information");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            int doctorId = doctor.getDoctor_id();

            // Tạo service order
            int serviceOrderId = serviceOrderDAO.createServiceOrder(doctorId, medicineRecordId);
            if (serviceOrderId == -1) {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Failed to create service order");
                mapper.writeValue(response.getWriter(), jsonResponse);
                return;
            }

            // Chuẩn bị danh sách service với doctor_id được chỉ định
            List<ServiceOrderItem> serviceOrderItems = new ArrayList<>();
            for (Map<String, Object> serviceData : services) {
                Integer serviceId = (Integer) serviceData.get("serviceId");
                Integer assignedDoctorId = (Integer) serviceData.get("doctorId");

                if (serviceId != null && assignedDoctorId != null) {
                    ServiceOrderItem item = new ServiceOrderItem();
                    item.setService_order_id(serviceOrderId);
                    item.setService_id(serviceId);
                    item.setDoctor_id(assignedDoctorId);
                    serviceOrderItems.add(item);
                }
            }

            // Tạo service order items
            boolean success = serviceOrderItemDAO.createMultipleServiceOrderItemsWithDoctors(serviceOrderItems);

            if (success) {
                // Cập nhật waitlist (status = Result, visittype = Waiting) nếu có waitlistId
                boolean waitlistUpdated = true;
                if (waitlistId != null) {
                    waitlistUpdated = waitlistDAO.updateStatusAndVisittype(waitlistId, "Result", "Waiting");
                }
                jsonResponse.put("success", true);
                jsonResponse.put("message", "Service order created successfully" + (waitlistId != null ? (waitlistUpdated ? " and waitlist updated" : " but failed to update waitlist") : ""));
                jsonResponse.put("serviceOrderId", serviceOrderId);
            } else {
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Failed to create service order items");
            }

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Internal server error: " + e.getMessage());
        }

        mapper.writeValue(response.getWriter(), jsonResponse);
    }
} 