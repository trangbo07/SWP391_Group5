package dao;

import model.AccountStaff;
import model.AccountPharmacist;
import model.AccountPatient;

public class AccountDAO {
    AccountStaffDAO accountStaffDAO = new AccountStaffDAO();
    AccountPharmacistDAO accountPharmacistDAO = new AccountPharmacistDAO();
    AccountPatientDAO accountPatientDAO = new AccountPatientDAO();

    public Object checkLogin(String username, String password) {
        AccountStaff staff = AccountStaffDAO.checkLogin(username, password);
        if (staff != null) {
            return staff;
        }

        AccountPharmacist pharmacist = AccountPharmacistDAO.checkLogin(username, password);
        if (pharmacist != null) {
            return pharmacist;
        }

        AccountPatient patient = AccountPatientDAO.checkLogin(username, password);
        if (patient != null) {
            return patient;
        }

        return null;
    }



    public Object checkAccount(String username, String email) {
        // Check AccountStaff
        if (AccountStaffDAO.checkAccountStaff(username, email)) {
            AccountStaff staff = AccountStaffDAO.checkLogin(username, email);
            if (staff != null) {
                return staff;
            }
        }

        // Check AccountPharmacist
        if (AccountPharmacistDAO.checkAccountPharmacist(username, email)) {
            AccountPharmacist pharmacist = AccountPharmacistDAO.checkLogin(username, email);
            if (pharmacist != null) {
                return pharmacist;
            }
        }

        // Check AccountPatient
        AccountPatient patient = AccountPatientDAO.checkLogin(username, email);
        if (patient != null) {
            return patient;
        }

        return null;
    }

    public Object checkAccount1(String username, String email) {
        // 1. Kiểm tra trong AccountPatientDAO
        AccountPatient patient = AccountPatientDAO.getAccountByEmailOrUsername(username);
        if (patient != null) {
            return patient;
        }
        patient = AccountPatientDAO.getAccountByEmailOrUsername(email);
        if (patient != null) {
            return patient;
        }

        // 2. Kiểm tra trong AccountStaffDAO
        AccountStaff staff = AccountStaffDAO.getAccountByEmailOrUsername(username);
        if (staff != null) {
            return staff;
        }
        staff = AccountStaffDAO.getAccountByEmailOrUsername(email);
        if (staff != null) {
            return staff;
        }

        // 3. Kiểm tra trong AccountPharmacistDAO
        AccountPharmacist pharmacist = AccountPharmacistDAO.getAccountByEmailOrUsername(username);
        if (pharmacist != null) {
            return pharmacist;
        }
        pharmacist = AccountPharmacistDAO.getAccountByEmailOrUsername(email);
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



}
