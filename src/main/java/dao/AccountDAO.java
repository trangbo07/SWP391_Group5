package dao;

import model.AccountStaff;
import model.AccountPharmacist;
import model.AccountPatient;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.List;

public class AccountDAO {
    AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
    AccountPharmacistDAO accountPharmacistDAO = new AccountPharmacistDAO();
    AccountPatientDAO accountPatientDAO = new AccountPatientDAO();

    public Object checkLogin(String username, String password) {
        AccountStaff staff = accountStaffDAO.checkLogin(username, password);
        if (staff != null) {
            return staff;
        }

        AccountPharmacist pharmacist = accountPharmacistDAO.checkLogin(username, password);
        if (pharmacist != null) {
            return pharmacist;
        }

        AccountPatient patient = accountPatientDAO.checkLogin(username, password);
        if (patient != null) {
            return patient;
        }

        return null;
    }

    public boolean checkAccount(String uoe) {
        AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
        AccountPharmacistDAO accountPharmacistDAO = new AccountPharmacistDAO();
        AccountPatientDAO accountPatientDAO = new AccountPatientDAO();

        return accountStaffDAO.checkAccountStaff(uoe)
                || accountPharmacistDAO.checkAccountPharmacist(uoe)
                || accountPatientDAO.getAccountByEmailOrUsername(uoe) != null
                || accountPatientDAO.getAccountByEmailOrUsername(uoe) != null;
    }

    public Object checkAccount1(String email) {
        AccountStaffDAO  accountStaffDAO = new AccountStaffDAO();
        AccountPharmacistDAO  accountPharmacistDAO = new AccountPharmacistDAO();
        AccountPatientDAO   accountPatientDAO = new AccountPatientDAO();
        // 1. Kiểm tra trong AccountPatientDAO
        AccountPatient patient = accountPatientDAO.getAccountByEmailOrUsername(email);
        if (patient != null) {
            return patient;
        }

        // 2. Kiểm tra trong AccountStaffDAO
        AccountStaff staff = accountStaffDAO.getAccountByEmailOrUsername(email);
        if (staff != null) {
            return staff;
        }

        // 3. Kiểm tra trong AccountPharmacistDAO
        AccountPharmacist pharmacist = accountPharmacistDAO.getAccountByEmailOrUsername(email);
        if (pharmacist != null) {
            return pharmacist;
        }

        // Không tìm thấy tài khoản
        return null;
    }


    public boolean updatePassword(String email, String newPassword) {
        // 1. Kiểm tra trong AccountPatientDAO
        AccountPatient patient = accountPatientDAO.getAccountByEmailOrUsername(email);
        if (patient != null) {
            return accountPatientDAO.updatePassword(email, newPassword);
        }

        // 2. Kiểm tra trong AccountStaffDAO
        AccountStaff staff = accountStaffDAO.getAccountByEmailOrUsername(email);
        if (staff != null) {
            return accountStaffDAO.updatePassword(email, newPassword);
        }

        // 3. Kiểm tra trong AccountPharmacistDAO
        AccountPharmacist pharmacist = accountPharmacistDAO.getAccountByEmailOrUsername(email);
        if (pharmacist != null) {
            return accountPharmacistDAO.updatePassword(email, newPassword);
        }

        // Không tìm thấy tài khoản với email này
        return false;
    }

    public boolean resetStaffPassword(int staffId, String generatedPassword) {
        String sql = "UPDATE AccountStaff SET password = ? WHERE account_staff_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, generatedPassword);
            ps.setInt(2, staffId);

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean resetPharmacistPassword(int accountPharmacistId, String generatedPassword) {
        String sql = "UPDATE AccountPharmacist SET password = ? WHERE account_pharmacist_id = ?";

        try (Connection conn = DBContext.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, generatedPassword);
            ps.setInt(2, accountPharmacistId);

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


}
