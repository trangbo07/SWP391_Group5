package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.AccountPatientDAO;
import dto.JsonResponse;
import dto.RegisterRequest;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.AccountPatient;
import util.PasswordHasherSHA256Util;

import java.io.IOException;

@WebServlet("/api/register")
public class RegisterServlet extends HttpServlet {

    private final ObjectMapper mapper = new ObjectMapper();
    private final AccountPatientDAO accountPatientDAO = new AccountPatientDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");


        RegisterRequest registerRequest = mapper.readValue(request.getReader(), RegisterRequest.class);
        String username = registerRequest.username;
        String email = registerRequest.email;
        String password = registerRequest.password;
        String re_password = registerRequest.re_password;

        JsonResponse jsonResponse;


        if (!password.equals(re_password)) {
            jsonResponse = new JsonResponse(false, "Password not match with re-password. Please try again.");
            mapper.writeValue(response.getWriter(), jsonResponse);
            return;
        }


        if (accountPatientDAO.getAccountByEmailOrUsername(username) != null ||
            accountPatientDAO.getAccountByEmailOrUsername(email) != null) {
            jsonResponse = new JsonResponse(false, "Username or email is already taken. Please try another.");
            mapper.writeValue(response.getWriter(), jsonResponse);
            return;
        }


        boolean created = accountPatientDAO.registerPatient(username, email, PasswordHasherSHA256Util.hashPassword(password), "/assets/images/uploads/default.jpg", "Enable");

        if (created) {
            jsonResponse = new JsonResponse(true, "Sign up successful ", "login.html");
        } else {
            jsonResponse = new JsonResponse(false, "sign up fails, please try again !.");
        }


        mapper.writeValue(response.getWriter(), jsonResponse);
    }
}
