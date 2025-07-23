package util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.io.UnsupportedEncodingException;

public final class PasswordHasherSHA256Util {

    private PasswordHasherSHA256Util() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    public static String hashPassword(String password) {
        if (password == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes("UTF-16LE"));
            return bytesToHex(hash).toUpperCase();
        } catch (NoSuchAlgorithmException | UnsupportedEncodingException e) {
            throw new RuntimeException("SHA-256 algorithm or encoding not found", e);
        }
    }

    public static boolean verifyPassword(String rawPassword, String hashedPassword) {
        if (rawPassword == null || hashedPassword == null) {
            return false;
        }
        String hashOfInput = hashPassword(rawPassword);
        return hashOfInput.equalsIgnoreCase(hashedPassword);
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String password = "AnhPhamSys2024";

        // Băm mật khẩu
        String hashed = PasswordHasherSHA256Util.hashPassword(password);
        System.out.println("Hash của mật khẩu '" + password + "': " + hashed);

        // Kiểm tra verify đúng
        boolean isMatch = PasswordHasherSHA256Util.verifyPassword("AnhPhamSys2024", hashed);
        System.out.println("Kiểm tra đúng mật khẩu: " + isMatch);

        // Kiểm tra verify sai
        boolean isMatchWrong = PasswordHasherSHA256Util.verifyPassword("sai_mat_khau", hashed);
        System.out.println("Kiểm tra sai mật khẩu: " + isMatchWrong);
    }
}