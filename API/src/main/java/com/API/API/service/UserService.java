package com.API.API.service;

import com.API.API.model.Department;
import com.API.API.model.Permission;
import com.API.API.model.User;
import com.API.API.model.UserPermission;
import com.API.API.repository.DepartmentRepository;
import com.API.API.repository.PermissionRepository;
import com.API.API.repository.UserPermissionRepository;
import com.API.API.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserPermissionRepository userPermissionRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    /**
     * Mã hóa mật khẩu bằng SHA-256
     */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = digest.digest(password.getBytes(StandardCharsets.UTF_8));
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

    /**
     * Đăng nhập người dùng
     */
    public Optional<User> login(String username, String password) {
        String hashedPassword = hashPassword(password);
        return userRepository.findByUsernameAndPassword(username, hashedPassword);
    }

    /**
     * Tạo người dùng mới
     */
    public User createUser(User user) {
        // Mã hóa mật khẩu trước khi lưu
        user.setPassword(hashPassword(user.getPassword()));

        // Gán phòng ban nếu có
        if (user.getDepartment() != null && user.getDepartment().getDepartmentId() != null) {
            Department department = departmentRepository.findById(user.getDepartment().getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            user.setDepartment(department); // Gán phòng ban cho user
        } else {
            user.setDepartment(null); // Nếu không có departmentId, đặt null
        }

        // Lưu user vào cơ sở dữ liệu
        User savedUser = userRepository.save(user);

        // Gán quyền từ phòng ban nếu user thuộc phòng ban
        if (savedUser.getDepartment() != null) {
            List<Permission> departmentPermissions = permissionRepository.findPermissionsByDepartmentId(savedUser.getDepartment().getDepartmentId());
            for (Permission permission : departmentPermissions) {
                UserPermission userPermission = new UserPermission();
                userPermission.setUser(savedUser); // Gán user vào quyền
                userPermission.setPermission(permission); // Gán quyền từ phòng ban
                userPermissionRepository.save(userPermission); // Lưu quyền vào cơ sở dữ liệu
            }
        }

        return savedUser;
    }


    /**
     * Gán user vào phòng ban và tự động gán quyền của phòng ban
     */
    public void addUserToDepartmentWithPermissions(Integer userId, Integer departmentId) {
        // Lấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Lấy department
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + departmentId));

        // Gán phòng ban cho user
        user.setDepartment(department);
        userRepository.save(user);

        // Lấy quyền của phòng ban
        List<Permission> departmentPermissions = permissionRepository.findPermissionsByDepartmentId(departmentId);

        // Xóa quyền cũ của user
        userPermissionRepository.deleteByUser_UserId(user.getUserId());

        // Gán quyền phòng ban cho user
        for (Permission permission : departmentPermissions) {
            UserPermission userPermission = new UserPermission();
            userPermission.setUser(user);
            userPermission.setPermission(permission);
            userPermissionRepository.save(userPermission);
        }
    }

    /**
     * Cập nhật quyền của tất cả user trong phòng ban
     */
    public void updateUserPermissionsByDepartment(Integer departmentId) {
        // Lấy tất cả user trong phòng ban
        List<User> users = userRepository.findByDepartment_DepartmentId(departmentId);

        // Lấy quyền của phòng ban
        List<Permission> departmentPermissions = permissionRepository.findPermissionsByDepartmentId(departmentId);

        for (User user : users) {
            // Xóa quyền cũ của user
            userPermissionRepository.deleteByUser_UserId(user.getUserId());

            // Gán quyền phòng ban cho user
            for (Permission permission : departmentPermissions) {
                UserPermission userPermission = new UserPermission();
                userPermission.setUser(user);
                userPermission.setPermission(permission);
                userPermissionRepository.save(userPermission);
            }
        }
    }

    /**
     * Cập nhật thông tin người dùng
     */
    public User updateUser(Integer id, User updatedUser, MultipartFile file) throws IOException {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setFullName(updatedUser.getFullName());
                    user.setEmail(updatedUser.getEmail());
                    user.setRole(updatedUser.getRole());

                    if (file != null && !file.isEmpty()) {
                        String avatarUrl = saveAvatar(file);
                        user.setAvatar(avatarUrl);
                    }

                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Lưu avatar
     */
    private String saveAvatar(MultipartFile file) {
        // Mock logic lưu avatar
        return "avatar_url";
    }

    /**
     * Xóa người dùng
     */
    public void deleteUser(Integer id) {
        userPermissionRepository.deleteByUser_UserId(id); // Xóa quyền liên quan đến user
        userRepository.deleteById(id);
    }

    /**
     * Lấy danh sách tất cả người dùng
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Lấy thông tin người dùng theo ID
     */
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }
}
