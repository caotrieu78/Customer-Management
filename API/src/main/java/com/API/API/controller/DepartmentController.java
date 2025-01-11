package com.API.API.controller;

import com.API.API.model.Department;
import com.API.API.model.User;
import com.API.API.service.DepartmentService;
import com.API.API.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;
    @Autowired
    private UserService userService;

    // Get all departments
    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    // Get department by ID
    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Integer id) {
        return departmentService.getDepartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new department
    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        Department createdDepartment = departmentService.createDepartment(department);
        return ResponseEntity.ok(createdDepartment);
    }

    // Update department by ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Integer id, @RequestBody Department updatedDepartment) {
        try {
            Department department = departmentService.updateDepartment(id, updatedDepartment);
            return ResponseEntity.ok(department);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/{departmentId}/users")
    public List<User> getUsersByDepartmentId(@PathVariable Integer departmentId) {
        try {
            return userService.getUsersByDepartmentId(departmentId);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching users for department: " + e.getMessage());
        }
    }
    // Delete department by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Integer id) {
        try {
            departmentService.deleteDepartment(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
