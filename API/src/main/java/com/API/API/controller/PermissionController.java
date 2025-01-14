package com.API.API.controller;

import com.API.API.dto.UpdateDepartmentPermissionsRequest;
import com.API.API.model.Permission;
import com.API.API.service.PermissionService;
import com.API.API.service.UserPermissionService;
import com.API.API.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private UserPermissionService userPermissionService;
    @Autowired
    private UserService userService;

    // Get all permissions
    @GetMapping("/all")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(permissions);
    }

    // Get permissions by departmentId
    @GetMapping("/{departmentId}")
    public ResponseEntity<List<Permission>> getPermissionsByDepartmentId(@PathVariable Integer departmentId) {
        List<Permission> permissions = permissionService.getPermissionsByDepartmentId(departmentId);
        // Trả về danh sách trống nếu không có quyền nào
        return ResponseEntity.ok(permissions);
    }


    // Get permissions by userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Permission>> getPermissionsByUserId(@PathVariable Integer userId) {
        List<Permission> userPermissions = userPermissionService.getPermissionsByUserId(userId);
        if (userPermissions.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userPermissions);
    }



    @PostMapping("/{userId}/assign-department/{departmentId}")
    public ResponseEntity<String> assignUserToDepartmentAndPermissions(
            @PathVariable Integer userId,
            @PathVariable Integer departmentId) {

        try {
            // Gán user vào phòng ban và gán quyền từ phòng ban
            userService.addUserToDepartmentWithPermissions(userId, departmentId);
            return ResponseEntity.ok("User đã được gán vào phòng ban và quyền được cập nhật từ phòng ban.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi gán quyền: " + e.getMessage());
        }
    }

    // Cập nhật quyền của phòng ban và đồng bộ quyền user
    @PutMapping("/update-department-permissions/{departmentId}")
    public ResponseEntity<String> updateDepartmentPermissions(
            @PathVariable Integer departmentId,
            @RequestBody List<Integer> permissionIds) {
        try {
            // Cập nhật quyền của phòng ban
            permissionService.updateDepartmentPermissions(departmentId, permissionIds);

            // Cập nhật quyền của user thuộc phòng ban
            userService.updateUserPermissionsByDepartment(departmentId);

            return ResponseEntity.ok("Quyền phòng ban và quyền của user đã được cập nhật.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi cập nhật quyền: " + e.getMessage());
        }
    }
    @DeleteMapping("/remove-department-permission/{departmentId}/{permissionId}")
    public ResponseEntity<String> removePermissionFromDepartmentAndSyncUsers(
            @PathVariable Integer departmentId,
            @PathVariable Integer permissionId) {
        try {
            // Bước 1: Xóa quyền khỏi phòng ban
            permissionService.removePermissionFromDepartment(departmentId, permissionId);

            // Bước 2: Cập nhật quyền cho các user thuộc phòng ban
            userService.removePermissionFromUsersByDepartment(departmentId, permissionId);

            return ResponseEntity.ok("Quyền đã được xóa khỏi phòng ban và đồng bộ với các user.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi xóa quyền và đồng bộ với user: " + e.getMessage());
        }
    }

    @PutMapping("/update-user-department-permissions/{userId}")
    public ResponseEntity<String> updateUserDepartmentAndPermissions(
            @PathVariable Integer userId,
            @RequestBody UpdateDepartmentPermissionsRequest request) {
        try {
            // Cập nhật phòng ban và quyền cho người dùng
            userService.updateUserDepartmentAndPermissions(userId, request.getDepartmentId());

            return ResponseEntity.ok("Phòng ban và quyền của người dùng đã được cập nhật ngay lập tức.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi cập nhật phòng ban và quyền người dùng: " + e.getMessage());
        }
    }



}
