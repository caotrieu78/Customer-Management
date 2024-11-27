package com.API.API.service;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailService {

    private final String defaultEmail = "myteam363636@gmail.com"; // Email mặc định
    private final String defaultPassword = "kfwl oufa xxfi crgq"; // Mật khẩu ứng dụng của Gmail

    public void sendEmail(String toEmail, String subject, String body) {
        try {
            // Cấu hình SMTP của Gmail
            Properties props = new Properties();
            props.put("mail.smtp.host", "smtp.gmail.com");
            props.put("mail.smtp.port", "587");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");

            // Xác thực tài khoản Gmail
            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(defaultEmail, defaultPassword);
                }
            });

            // Tạo nội dung email
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(defaultEmail));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject(subject);

            // Cấu hình nội dung email dưới dạng HTML
            message.setContent(body, "text/html; charset=UTF-8");

            // Gửi email
            Transport.send(message);
            System.out.println("Email đã gửi thành công tới: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("Lỗi khi gửi email: " + e.getMessage());
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        }
    }
}
