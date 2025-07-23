package dao;

import model.AccountPatient;
import java.sql.*;
import util.PasswordHasherSHA256Util;

public class AccountPatientDAO {
    public AccountPatient checkLogin(String username, String password) {
        DBContext db = DBContext.getInstance();
        AccountPatient patient = null;

        try {
            String hashedPassword = PasswordHasherSHA256Util.hashPassword(password).toUpperCase();
            String sql = """    
                         SELECT * FROM AccountPatient WHERE (username = ? OR email = ?) AND password = ?
                         """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, username);
            statement.setString(2, username);
            statement.setString(3, hashedPassword);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                patient = new AccountPatient(
                        rs.getInt("account_patient_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status")
                );
            }
        } catch (Exception e) {
            return null;
        }

        return patient;
    }

    public boolean registerPatient(String username ,String email, String password, String img, String status) {
        DBContext db = DBContext.getInstance();

        try {
            // Kiểm tra email đã tồn tại chưa
            String checkSql = "SELECT COUNT(*) FROM AccountPatient WHERE email = ?";
            PreparedStatement checkStmt = db.getConnection().prepareStatement(checkSql);
            checkStmt.setString(1, email);
            ResultSet rs = checkStmt.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                return false; // Email đã tồn tại
            }

            // Chưa tồn tại → thêm mới
            String sql = "INSERT INTO AccountPatient(username, password, email, img ,status) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ps.setString(1, username);
            ps.setString(2, password);
            ps.setString(3, email);
            ps.setString(4, img);
            ps.setString(5, status);

            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;

        } catch (Exception e) {
            System.err.println("Lỗi khi đăng ký: " + e.getClass().getName() + " - " + e.getMessage());
            return false;
        }
    }

    public boolean updatePassword(String email, String newPassword) {
        DBContext db = DBContext.getInstance();

        try {
            String sql = "UPDATE AccountPatient SET password = ? WHERE email = ?";
            PreparedStatement ps = db.getConnection().prepareStatement(sql);
            ps.setString(1, PasswordHasherSHA256Util.hashPassword(newPassword)); // hash password before saving
            ps.setString(2, email);
            int rowsAffected = ps.executeUpdate();
            ps.close();
            return rowsAffected > 0;
        } catch (Exception e) {
            System.err.println("Error updating password: " + e.getClass().getName() + " - " + e.getMessage());
            return false;
        }
    }

    public AccountPatient getAccountByEmailOrUsername(String emailOrUsername) {
        DBContext db = DBContext.getInstance();
        AccountPatient patient = null;

        try {
            String sql = """
                     SELECT * FROM AccountPatient 
                     WHERE username = ? OR email = ?
                     """;
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setString(1, emailOrUsername);
            statement.setString(2, emailOrUsername);

            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                patient = new AccountPatient(
                        rs.getInt("account_patient_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status")
                );
            }

            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return patient;
    }

    public Integer getPatientIdByAccountPatientId(int accountPatientId) {
        DBContext db = DBContext.getInstance();
        Integer patientId = null;
        try {
            String sql = "SELECT patient_id FROM Patient_AccountPatient WHERE account_patient_id = ?";
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, accountPatientId);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                patientId = rs.getInt("patient_id");
            }
            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return patientId;
    }

    public model.Patient getPatientById(int patientId) {
        DBContext db = DBContext.getInstance();
        model.Patient patient = null;
        try {
            String sql = "SELECT * FROM Patient WHERE patient_id = ?";
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, patientId);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                patient = new model.Patient(
                    rs.getInt("patient_id"),
                    rs.getString("full_name"),
                    rs.getString("dob"),
                    rs.getString("gender"),
                    rs.getString("phone"),
                    rs.getString("address")
                );
            }
            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return patient;
    }

    public class PatientProfile {
        public AccountPatient accountPatient;
        public model.Patient patient;
    }

    public PatientProfile getPatientProfileByAccountPatientId(int accountPatientId) {
        PatientProfile profile = new PatientProfile();
        profile.accountPatient = getAccountById(accountPatientId);
        Integer patientId = getPatientIdByAccountPatientId(accountPatientId);
        if (patientId != null) {
            profile.patient = getPatientById(patientId);
        }
        return profile;
    }

    // Thêm hàm getAccountById
    public AccountPatient getAccountById(int accountPatientId) {
        DBContext db = DBContext.getInstance();
        AccountPatient patient = null;
        try {
            String sql = "SELECT * FROM AccountPatient WHERE account_patient_id = ?";
            PreparedStatement statement = db.getConnection().prepareStatement(sql);
            statement.setInt(1, accountPatientId);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                patient = new AccountPatient(
                        rs.getInt("account_patient_id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("email"),
                        rs.getString("img"),
                        rs.getString("status")
                );
            }
            rs.close();
            statement.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return patient;
    }

}

