package com.API.API.controller;

import com.API.API.service.UserPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-permissions")
public class UserPermissionController {

    @Autowired
    private UserPermissionService userPermissionService;

    // Gán quyền cho người dùng
    @PostMapping("/assign")
    public ResponseEntity<String> assignPermissionsToUser(@RequestBody AssignPermissionsRequest request) {
        try {
            if (request.getUserId() == null || request.getPermissionIds() == null || request.getPermissionIds().isEmpty()) {
                return ResponseEntity.badRequest().body("User ID hoặc danh sách quyền không được để trống.");
            }

            userPermissionService.assignPermissionsToUser(request.getUserId(), request.getPermissionIds());
            return ResponseEntity.ok("Gán quyền thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi gán quyền: " + e.getMessage());
        }
    }

    // Lớp để nhận payload
    public static class AssignPermissionsRequest {
        private Integer userId;
        private List<Integer> permissionIds;

        // Getters và Setters
        public Integer getUserId() {
            return userId;
        }

        public void setUserId(Integer userId) {
            this.userId = userId;
        }

        public List<Integer> getPermissionIds() {
            return permissionIds;
        }

        public void setPermissionIds(List<Integer> permissionIds) {
            this.permissionIds = permissionIds;
        }
    }
}
