package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.AccountDAO;
import dto.JsonResponse;
import dto.LoginRequest;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.AccountPatient;
import model.AccountPharmacist;
import model.AccountStaff;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    private final AccountDAO accountDAO = new AccountDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        LoginRequest loginRequest = mapper.readValue(request.getReader(), LoginRequest.class);
        String username = loginRequest.username;
        String password = loginRequest.password;
        boolean rememberme = loginRequest.rememberme;

        Object account = accountDAO.checkLogin(username, password);
        JsonResponse jsonResponse;

        if (account != null) {
                HttpSession session = request.getSession();
                session.setAttribute("user", account);

            String redirectUrl = "view/home.html";

            if (account instanceof AccountStaff staff) {
                String role = staff.getRole();
                switch (role) {
                    case "Doctor":
                        redirectUrl = "home-doctor.html";
                        break;
                    case "Receptionist":
                        redirectUrl = "home-receptionist.html";
                        break;
                    case "AdminSys":
                        redirectUrl = "home-adminsys.html";
                        break;
                    case "AdminBusiness":
                        redirectUrl = "home-adminbusiness.html";
                        session.setAttribute("adminBusinessId", staff.getAccountStaffId());
                        break;
                }
            } else if (account instanceof AccountPharmacist) {
                redirectUrl = "home-pharmacist.html";
            } else if (account instanceof AccountPatient) {
                redirectUrl = "home-patient.html";
            }

            jsonResponse = new JsonResponse(true, "Login successful", redirectUrl);
        } else {
            jsonResponse = new JsonResponse(false, "Incorrect username or password");
        }

        mapper.writeValue(response.getWriter(), jsonResponse);
    }
}


