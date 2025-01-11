package com.API.API.controller;

import com.API.API.dto.LoginRequest;
import com.API.API.dto.LoginResponse;
import com.API.API.dto.UserWithDepartmentResponse;
import com.API.API.model.Department;
import com.API.API.model.User;
import com.API.API.service.DepartmentService;
import com.API.API.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private DepartmentService departmentService;

    // POST: /api/users/login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> user = userService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (user.isPresent()) {
            User loggedInUser = user.get();
            return ResponseEntity.ok(new LoginResponse(
                    "Login successful!",
                    true,
                    loggedInUser.getUserId(),
                    loggedInUser.getUsername(),
                    loggedInUser.getRole().toString()
            ));
        } else {
            return ResponseEntity.status(401).body(new LoginResponse(
                    "Invalid username or password",
                    false,
                    null,
                    null,
                    null
            ));
        }
    }

    // GET: /api/users
    @GetMapping
    public List<UserWithDepartmentResponse> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(user -> new UserWithDepartmentResponse(
                        user.getUserId(),
                        user.getUsername(),
                        user.getPassword(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getAvatar(),
                        user.getCreatedAt(),
                        user.getUpdatedAt(),
                        user.getDepartment() // Trả về null nếu không có phòng ban
                ))
                .toList();
    }

    // GET: /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(new UserWithDepartmentResponse(
                        user.getUserId(),
                        user.getUsername(),
                        user.getPassword(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getAvatar(),
                        user.getCreatedAt(),
                        user.getUpdatedAt(),
                        user.getDepartment()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            // Tạo user và tự động gán quyền từ phòng ban
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }


    // PUT: /api/users/{id}
    // PUT: /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id,
                                           @RequestParam(value = "file", required = false) MultipartFile file,
                                           @RequestParam("username") String username,
                                           @RequestParam("fullName") String fullName,
                                           @RequestParam("email") String email,
                                           @RequestParam("role") String role,
                                           @RequestParam(value = "departmentId", required = false) Integer departmentId) {
        try {
            User updatedUser = new User();
            updatedUser.setUsername(username);
            updatedUser.setFullName(fullName);
            updatedUser.setEmail(email);
            updatedUser.setRole(User.Role.valueOf(role));

            // Nếu có departmentId, thiết lập phòng ban cho người dùng
            if (departmentId != null) {
                Department department = departmentService.getDepartmentById(departmentId)
                        .orElseThrow(() -> new RuntimeException("Department not found"));  // Sử dụng orElseThrow để ném ngoại lệ nếu không tìm thấy phòng ban
                updatedUser.setDepartment(department);  // Gán phòng ban cho người dùng
            }

            // Cập nhật người dùng với phòng ban mới (nếu có)
            User savedUser = userService.updateUser(id, updatedUser, file);
            return ResponseEntity.ok(savedUser);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);  // Nếu không tìm thấy phòng ban, trả về lỗi 404
        }
    }




    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
