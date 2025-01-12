import axios from "axios";
import environments from "../constant/environment";

const API_BASE_URL = environments.apiBaseUrl;

// Hàm tiện ích để xử lý yêu cầu API
const handleRequest = async (request) => {
    try {
        const response = await request();
        return response.data;
    } catch (error) {
        console.error("Lỗi yêu cầu API:", error.response || error.message);
        throw error.response?.data || new Error("Yêu cầu API thất bại");
    }
};

// ============================
// API cho Notifications (Thông báo)
// ============================

// 1. Lấy danh sách tất cả các thông báo
export const getAllNotifications = async () => {
    return handleRequest(() => axios.get(`${API_BASE_URL}/notifications`));
};

// 2. Lấy chi tiết một thông báo theo ID
export const getNotificationById = async (notificationId) => {
    return handleRequest(() =>
        axios.get(`${API_BASE_URL}/notifications/${notificationId}`)
    );
};

// 3. Lấy nội dung mẫu (template) cho thông báo
export const getNotificationContent = async (notificationId) => {
    return handleRequest(() =>
        axios.get(`${API_BASE_URL}/notifications/${notificationId}/content`)
    );
};

// 4. Tạo mới một thông báo
export const createNotification = async (notification) => {
    return handleRequest(() =>
        axios.post(`${API_BASE_URL}/notifications`, notification)
    );
};

// 5. Cập nhật trạng thái thông báo
export const updateNotificationStatus = async (notificationId, status) => {
    return handleRequest(() =>
        axios.put(`${API_BASE_URL}/notifications/${notificationId}/status`, null, {
            params: { status }
        })
    );
};

// 6. Xóa một thông báo
export const deleteNotification = async (notificationId) => {
    return handleRequest(() =>
        axios.delete(`${API_BASE_URL}/notifications/${notificationId}`)
    );
};

// 7. Gửi thông báo (hỗ trợ gửi nội dung và tệp đính kèm)
export const sendNotification = async (notificationId, data) => {
    return handleRequest(() =>
        axios.put(`${API_BASE_URL}/notifications/${notificationId}/send`, data, {
            headers: {
                "Content-Type": "multipart/form-data" // Đảm bảo rằng content-type là multipart/form-data
            }
        })
    );
};
