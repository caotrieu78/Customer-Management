package com.API.API.service;

import com.API.API.model.Department;
import com.API.API.model.DepartmentPermission;
import com.API.API.model.Permission;
import com.API.API.repository.DepartmentPermissionRepository;
import com.API.API.repository.DepartmentRepository;
import com.API.API.repository.PermissionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private DepartmentPermissionRepository departmentPermissionRepository;
    @Autowired
    private DepartmentRepository departmentRepository;

    /**
     * Lấy tất cả quyền
     */
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    /**
     * Lấy quyền theo departmentId
     */
    public List<Permission> getPermissionsByDepartmentId(Integer departmentId) {
        return permissionRepository.findPermissionsByDepartmentId(departmentId);
    }


    /**
     * Cập nhật quyền của phòng ban
     */
    @Transactional
    public void updateDepartmentPermissions(Integer departmentId, List<Integer> permissionIds) {
        // Lấy quyền hiện tại của phòng ban
        List<Permission> currentPermissions = getPermissionsByDepartmentId(departmentId);

        // Duyệt qua các permissionIds mới và kiểm tra nếu quyền chưa có thì thêm vào
        for (Integer permissionId : permissionIds) {
            // Kiểm tra xem quyền này đã có trong phòng ban chưa
            boolean exists = currentPermissions.stream()
                    .anyMatch(permission -> permission.getPermissionID().equals(permissionId));

            if (!exists) {
                // Nếu quyền chưa tồn tại, thêm quyền vào phòng ban
                addPermissionToDepartment(departmentId, permissionId);
            }
        }
    }
    @Transactional
    public void removePermissionFromDepartment(Integer departmentId, Integer permissionId) {
        // Tìm quyền của phòng ban từ bảng department_permissions
        DepartmentPermission departmentPermission = departmentPermissionRepository.findByDepartment_DepartmentIdAndPermission_PermissionID(departmentId, permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found for this department"));

        // Xóa quyền khỏi phòng ban
        departmentPermissionRepository.delete(departmentPermission);
    }
    // Thêm quyền vào phòng ban
    public void addPermissionToDepartment(Integer departmentId, Integer permissionId) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with ID: " + permissionId));

        DepartmentPermission departmentPermission = new DepartmentPermission();
        Department department = new Department();
        department.setDepartmentId(departmentId);
        departmentPermission.setDepartment(department);
        departmentPermission.setPermission(permission);

        departmentPermissionRepository.save(departmentPermission);
    }


}
