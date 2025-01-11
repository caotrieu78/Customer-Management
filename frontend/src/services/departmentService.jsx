import axios from "axios";
import environments from "../constant/environment";

const API_BASE_URL = environments.apiBaseUrl;

// Lấy tất cả phòng ban
export const getAllDepartments = async () => {
    const response = await axios.get(`${API_BASE_URL}/departments`);
    return response.data;
};

// Lấy thông tin phòng ban theo ID
export const getDepartmentById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/departments/${id}`);
    return response.data;
};

// Tạo phòng ban mới
export const createDepartment = async (department) => {
    const response = await axios.post(`${API_BASE_URL}/departments`, department);
    return response.data;
};

// Cập nhật phòng ban
export const updateDepartment = async (id, department) => {
    const response = await axios.put(`${API_BASE_URL}/departments/${id}`, department);
    return response.data;
};

// Xóa phòng ban
export const deleteDepartment = async (id) => {
    await axios.delete(`${API_BASE_URL}/departments/${id}`);
};

// Gán quyền cho phòng ban
export const assignPermissionsToDepartment = async (departmentId, permissionIds) => {
    const response = await axios.post(`${API_BASE_URL}/department-permissions/assign`, {
        departmentId,
        permissionIds
    });
    return response.data;
};

// Lấy danh sách quyền của phòng ban
export const getPermissionsByDepartmentId = async (departmentId) => {
    const response = await axios.get(`${API_BASE_URL}/permissions/${departmentId}`);
    return response.data;
};

// Gán user vào phòng ban và gán quyền từ phòng ban
export const assignUserToDepartment = async (userId, departmentId) => {
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/assign-department/${departmentId}`);
    return response.data;
};
