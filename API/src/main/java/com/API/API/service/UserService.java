package com.API.API.service;

import com.API.API.model.User;
import com.API.API.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Formatter;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Hàm mã hóa mật khẩu bằng SHA-256
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = digest.digest(password.getBytes(StandardCharsets.UTF_8));

            // Chuyển đổi byte[] thành chuỗi Hexadecimal
            try (Formatter formatter = new Formatter()) {
                for (byte b : hashedBytes) {
                    formatter.format("%02x", b);
                }
                return formatter.toString();
            }
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error while hashing password", e);
        }
    }

    // Xác thực đăng nhập
    public Optional<User> login(String username, String password) {
        // Mã hóa mật khẩu người dùng nhập vào
        String hashedPassword = hashPassword(password);

        // So sánh với mật khẩu đã mã hóa trong cơ sở dữ liệu
        return userRepository.findByUsernameAndPassword(username, hashedPassword);
    }


    // Tạo người dùng mới (chỉ mã hóa khi lưu)
    public User createUser(User user) {
        // Mã hóa mật khẩu trước khi lưu vào database
        user.setPassword(hashPassword(user.getPassword()));
        return userRepository.save(user);
    }

    // Cập nhật người dùng (chỉ mã hóa mật khẩu nếu được thay đổi)
    // Cập nhật người dùng (chỉ mã hóa mật khẩu nếu được thay đổi và chưa mã hóa)
    public User updateUser(Integer id, User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                        // Kiểm tra mật khẩu mới có phải dạng SHA-256 hay không
                        if (!isPasswordHashed(updatedUser.getPassword())) {
                            user.setPassword(hashPassword(updatedUser.getPassword())); // Mã hóa nếu chưa mã hóa
                        } else {
                            user.setPassword(updatedUser.getPassword()); // Giữ nguyên nếu đã mã hóa
                        }
                    }
                    user.setFullName(updatedUser.getFullName());
                    user.setEmail(updatedUser.getEmail());
                    user.setRole(updatedUser.getRole());
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    // Hàm kiểm tra xem mật khẩu đã được mã hóa SHA-256 hay chưa
    private boolean isPasswordHashed(String password) {
        return password.matches("^[a-fA-F0-9]{64}$"); // SHA-256 luôn là chuỗi Hex dài 64 ký tự
    }

    // Xóa người dùng
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    // Lấy tất cả người dùng
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Lấy người dùng theo ID
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }
}
