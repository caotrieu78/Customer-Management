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



// Cập nhật quyền của phòng ban và đồng bộ quyền user
export const updateDepartmentPermissions = async (departmentId, permissionIds) => {
    try {
        // Gửi PUT request với departmentId và permissionIds
        const response = await axios.put(
            `${API_BASE_URL}/permissions/update-department-permissions/${departmentId}`,
            permissionIds, // Body là danh sách permissionId
            {
                headers: {
                    "Content-Type": "application/json", // Đảm bảo gửi dữ liệu dưới dạng JSON
                },
            }
        );
        return response.data; // Trả về kết quả nhận được từ API
    } catch (error) {
        console.error("Error updating department permissions:", error);
        throw error; // Ném lỗi để có thể xử lý ở nơi gọi API
    }
};
// Xóa quyền của phòng ban
export const removePermissionFromDepartment = async (departmentId, permissionId) => {
    try {
        // Gửi DELETE request với departmentId và permissionId trên URL
        const response = await axios.delete(`${API_BASE_URL}/permissions/remove-department-permission/${departmentId}/${permissionId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data; // Trả về kết quả nhận được từ API
    } catch (error) {
        console.error("Error removing permission from department:", error);
        throw error; // Ném lỗi để có thể xử lý ở nơi gọi API
    }
};

// Lấy danh sách người dùng của phòng ban
export const getUsersByDepartmentId = async (departmentId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/departments/${departmentId}/users`);
        return response.data; // Trả về danh sách người dùng trong phòng ban
    } catch (error) {
        console.error("Error fetching users for department:", error);
        throw error; // Ném lỗi nếu có vấn đề
    }
};


// Cập nhật phòng ban và quyền cho người dùng
export const updateUserDepartmentAndPermissions = async (userId, departmentId) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/permissions/update-user-department-permissions/${userId}`,
            { departmentId }, // Gửi departmentId trong body request
            {
                headers: {
                    "Content-Type": "application/json", // Đảm bảo gửi dữ liệu dưới dạng JSON
                },
            }
        );
        return response.data; // Trả về kết quả nhận được từ API
    } catch (error) {
        console.error("Error updating user department and permissions:", error);
        throw error; // Ném lỗi để có thể xử lý ở nơi gọi API
    }
};
