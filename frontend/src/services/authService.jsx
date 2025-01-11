import axios from "axios";
import environments from "../constant/environment";

const API_BASE_URL = environments.apiBaseUrl;

export const login = async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/users/login`, { username, password });
    return response.data; // Ensure response contains user data
};

export const getAllUsers = async () => {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
};

export const getUserById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
};

export const createUser = async (user) => {
    const response = await axios.post(`${API_BASE_URL}/users`, user);
    return response.data;
};

export const updateUser = async (id, formData) => {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const deleteUser = async (id) => {
    await axios.delete(`${API_BASE_URL}/users/${id}`);
};

// 1. Get All Permissions
export const getAllPermissions = async () => {
    const response = await axios.get(`${API_BASE_URL}/permissions/all`);
    return response.data; // Returning all permissions
};
// 2. Get Permissions by User ID
export const getPermissionsByUserId = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/permissions/user/${userId}`);
    return response.data; // Returning permissions for a specific user
};

// 3. Assign Permission to User
export const assignPermissionToUser = async (userId, permissionIds) => {
    const response = await axios.post(`${API_BASE_URL}/user-permissions/assign`, {
        userId,
        permissionIds
    });
    return response.data; // Returning the data after assigning the permission
};

// 4. Remove Permission from User
export const removePermissionFromUser = async (userId, permissionId) => {
    const response = await axios.delete(`${API_BASE_URL}/user-permissions/remove`, {
        data: { userId, permissionId }
    });
    return response.data; // Returning response after removing permission
};