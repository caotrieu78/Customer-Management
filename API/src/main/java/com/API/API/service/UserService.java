package com.API.API.service;

import com.API.API.model.Department;
import com.API.API.model.Permission;
import com.API.API.model.User;
import com.API.API.model.UserPermission;
import com.API.API.repository.DepartmentRepository;
import com.API.API.repository.PermissionRepository;
import com.API.API.repository.UserPermissionRepository;
import com.API.API.repository.UserRepository;
import jakarta.transaction.Transactional;
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

    @Transactional
    public void updateUserDepartmentAndPermissions(Integer userId, Integer departmentId) {
        // Lấy thông tin người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Lấy thông tin phòng ban
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + departmentId));

        // Cập nhật phòng ban cho người dùng
        user.setDepartment(department);
        userRepository.save(user);  // Lưu thay đổi của người dùng vào cơ sở dữ liệu

        // Lấy danh sách quyền của phòng ban
        List<Permission> departmentPermissions = permissionRepository.findPermissionsByDepartmentId(departmentId);

        // Xóa tất cả quyền cũ của người dùng
        userPermissionRepository.deleteByUser_UserId(userId);

        // Gán quyền từ phòng ban cho người dùng
        for (Permission permission : departmentPermissions) {
            // Kiểm tra xem quyền đã tồn tại trong bảng user_permissions chưa
            boolean exists = userPermissionRepository.existsByUserAndPermission(user, permission);
            if (!exists) {
                UserPermission userPermission = new UserPermission();
                userPermission.setUser(user);
                userPermission.setPermission(permission);
                userPermissionRepository.save(userPermission);  // Lưu quyền mới cho người dùng
            }
        }
    }


    /**
     * Cập nhật quyền của tất cả user trong phòng ban
     */
    @Transactional
    public void updateUserPermissionsByDepartment(Integer departmentId) {
        // Lấy tất cả user trong phòng ban
        List<User> users = userRepository.findByDepartment_DepartmentId(departmentId);

        // Lấy quyền của phòng ban
        List<Permission> departmentPermissions = permissionRepository.findPermissionsByDepartmentId(departmentId);

        for (User user : users) {
            // Kiểm tra và thêm quyền mới cho mỗi user nếu quyền chưa có
            for (Permission permission : departmentPermissions) {
                Optional<UserPermission> existingUserPermission = userPermissionRepository.findByUserAndPermission(user, permission);
                if (existingUserPermission.isEmpty()) {
                    // Nếu quyền chưa tồn tại, thêm quyền vào user
                    UserPermission userPermission = new UserPermission();
                    userPermission.setUser(user);
                    userPermission.setPermission(permission);
                    userPermissionRepository.save(userPermission);
                }
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

                    // Cập nhật phòng ban nếu có
                    if (updatedUser.getDepartment() != null) {
                        user.setDepartment(updatedUser.getDepartment());
                    }

                    // Nếu có avatar mới, cập nhật
                    if (file != null && !file.isEmpty()) {
                        String avatarUrl = saveAvatar(file);
                        user.setAvatar(avatarUrl);
                    }

                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }



    // Phương thức lấy người dùng của phòng ban
    public List<User> getUsersByDepartmentId(Integer departmentId) {
        return userRepository.findByDepartment_DepartmentId(departmentId); // Tìm người dùng theo departmentId
    }
    @Transactional
    public void removePermissionFromUsersByDepartment(Integer departmentId, Integer permissionId) {
        // Lấy tất cả người dùng thuộc phòng ban
        List<User> users = userRepository.findByDepartment_DepartmentId(departmentId);

        // Lấy quyền cần xóa
        Permission permissionToRemove = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        for (User user : users) {
            // Tìm và xóa quyền khỏi người dùng nếu quyền tồn tại
            Optional<UserPermission> userPermission = userPermissionRepository.findByUserAndPermission(user, permissionToRemove);
            if (userPermission.isPresent()) {
                // Xóa quyền khỏi người dùng
                userPermissionRepository.delete(userPermission.get());
            }
        }
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
