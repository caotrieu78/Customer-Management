package com.API.API.service;

import com.API.API.model.Department;
import com.API.API.model.DepartmentPermission;
import com.API.API.model.Permission;
import com.API.API.repository.DepartmentPermissionRepository;
import com.API.API.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private DepartmentPermissionRepository departmentPermissionRepository;

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
    public void updateDepartmentPermissions(Integer departmentId, List<Integer> permissionIds) {
        // Xóa quyền hiện tại của phòng ban
        departmentPermissionRepository.deleteByDepartment_DepartmentId(departmentId);

        // Gán quyền mới cho phòng ban
        for (Integer permissionId : permissionIds) {
            Permission permission = permissionRepository.findById(permissionId)
                    .orElseThrow(() -> new IllegalArgumentException("Permission not found with ID: " + permissionId));

            // Tạo đối tượng DepartmentPermission và lưu vào cơ sở dữ liệu
            DepartmentPermission departmentPermission = new DepartmentPermission();

            // Nếu DepartmentPermission sử dụng đối tượng Department
            Department department = new Department();
            department.setDepartmentId(departmentId);
            departmentPermission.setDepartment(department);

            departmentPermission.setPermission(permission);
            departmentPermissionRepository.save(departmentPermission);
        }
    }
}
