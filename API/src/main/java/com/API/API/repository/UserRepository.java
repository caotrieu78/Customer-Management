package com.API.API.repository;

import com.API.API.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUsernameAndPassword(String username, String password);
    List<User> findByDepartment_DepartmentId(Integer departmentId);// Kiểm tra mật khẩu đã băm
}
