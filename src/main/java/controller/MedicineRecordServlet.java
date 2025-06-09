package controller;

import dao.MedicineRecordDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.MedicineRecord;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "MedicineRecord", urlPatterns = {"/medical-record"})
public class MedicineRecordServlet  extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pid = request.getParameter("patientId");

        try {
            int patientId = Integer.parseInt(pid);

            List<MedicineRecord> records = MedicineRecordDAO.getRecordsByPatientId(patientId);

            if (records == null || records.isEmpty()) {
                request.setAttribute("message", "Cant not found medical record with this patient ID: " + patientId);
            } else {
                request.setAttribute("records", records);
                request.setAttribute("patientId", patientId);
            }

            request.getRequestDispatcher("view/medicineRecord.html").forward(request, response);

        } catch (NumberFormatException e) {
            response.sendRedirect("view/error.html?message=Invalid+patientId");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
}
