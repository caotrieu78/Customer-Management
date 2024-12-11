package com.API.API.controller;

import com.API.API.model.Permission;
import com.API.API.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    // Get all permissions
    @GetMapping("/all")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(permissions);
    }

    // Get permissions by userId
    @GetMapping("/{userId}")
    public ResponseEntity<List<Permission>> getPermissionsByUserId(@PathVariable Integer userId) {
        List<Permission> permissions = permissionService.getPermissionsByUserId(userId);
        if (permissions.isEmpty()) {
            return ResponseEntity.notFound().build(); // No permissions found
        }
        return ResponseEntity.ok(permissions);
    }
}
