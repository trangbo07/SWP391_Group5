package controller;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.AccountPatient;
import model.AccountPharmacist;
import model.AccountStaff;

import java.io.IOException;

@WebServlet("/api/home")
public class  HomeServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false); // false: không tạo mới nếu chưa có

        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect(request.getContextPath() + "/view/home.html");
            return;
        }

        Object user = session.getAttribute("user");

        if (user instanceof AccountStaff) {
            AccountStaff staff = (AccountStaff) user;
            String role = staff.getRole().toLowerCase();

            switch (role) {
                case "doctor":
                    response.sendRedirect(request.getContextPath() + "/view/home-doctor.html");
                    break;
                case "receptionist":
                    response.sendRedirect(request.getContextPath() + "/view/home-receptionist.html");
                    break;
                case "nurse":
                    response.sendRedirect(request.getContextPath() + "/view/home-nurse.html");
                    break;
                case "adminsys":
                    response.sendRedirect(request.getContextPath() + "/view/home-adminsys.html");
                    break;
                case "adminbusiness":
                    response.sendRedirect(request.getContextPath() + "/view/home-adminbusiness.html");
                    break;
                default:
                    response.sendRedirect(request.getContextPath() + "/view/home-staff.html");
                    break;
            }
        } else if (user instanceof AccountPharmacist) {
            response.sendRedirect(request.getContextPath() + "/view/home-pharmacist.html");
        } else if (user instanceof AccountPatient) {
            response.sendRedirect(request.getContextPath() + "/view/home-patient.html");
        } else {
            response.sendRedirect(request.getContextPath() + "/view/login.html");
        }
    }
}
