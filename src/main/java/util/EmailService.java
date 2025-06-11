package util;

import java.util.Properties;
import javax.mail.*;
import javax.mail.internet.*;

public class EmailService {
    private static final String FROM = "trangnkhe186034@fpt.edu.vn";
    private static final String PASSWORD = "wdlh xokg dizk qdhl"; // App Password từ Gmail

    public static boolean sendEmail(String to, String subject, String content) {
        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(FROM, PASSWORD);
            }
        });

        try {
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(FROM));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject, "UTF-8");
            message.setContent(content, "text/html; charset=UTF-8");
            Transport.send(message);
            return true;
        } catch (MessagingException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static String generateOtpEmailContent(String otp) {
        return "Hello,<br><br>"
                + "You have requested to reset your password for the Medical Clinic & Patient Management system.<br><br>"
                + "Your OTP code is: <b>" + otp + "</b><br><br>"
                + "Please enter this code on the website to proceed with resetting your password. This code is valid for 10 minutes.<br><br>"
                + "If you did not request a password reset, please ignore this email.<br><br>"
                + "Best regards,<br>"
                + "KiviCare Team";
    }
}