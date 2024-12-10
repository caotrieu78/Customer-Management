import React, { useState, useEffect } from "react";
import {
    getAllNotifications,
    sendNotification
} from "../../services/eventNotificationServices";

function NotificationList() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedNotificationId, setSelectedNotificationId] = useState(null);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("all"); // Bộ lọc trạng thái: all, upcoming, past, happening
    const [filteredNotifications, setFilteredNotifications] = useState([]); // Danh sách thông báo đã lọc

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.userId) {
                    throw new Error("Thông tin người dùng bị thiếu.");
                }

                const data = await getAllNotifications();

                // Lọc thông báo dựa trên userId
                const filteredNotifications = data.filter(
                    (notification) => notification.eventUser.user.userId === user.userId
                );

                setNotifications(filteredNotifications);
                setFilteredNotifications(filteredNotifications); // Gán dữ liệu ban đầu vào filteredNotifications
            } catch (err) {
                setError("Không thể tải danh sách thông báo.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleSendNotification = async () => {
        if (!message.trim()) {
            alert("Vui lòng nhập nội dung thông báo.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const sentAt = new Date().toISOString();
            const response = await sendNotification(selectedNotificationId, {
                message,
                sentAt
            });
            setSuccessMessage(
                `Thông báo tới khách hàng ${response.eventUser.customer.name} đã gửi thành công!`
            );

            setNotifications((prev) =>
                prev.map((n) =>
                    n.notificationId === selectedNotificationId
                        ? { ...n, status: "Success", sentAt, message }
                        : n
                )
            );
            setShowModal(false);
            setMessage(""); // Reset nội dung thông báo
        } catch (err) {
            setError("Không thể gửi thông báo. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (notificationId) => {
        setSelectedNotificationId(notificationId);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setMessage("");
    };

    // Lọc thông báo theo trạng thái
    useEffect(() => {
        const now = new Date();
        const filtered = notifications.filter((notification) => {
            const eventDate = new Date(notification.eventUser.event.eventDate);

            if (filter === "upcoming") {
                return eventDate > now; // Sắp tới
            } else if (filter === "past") {
                return eventDate < now; // Đã diễn ra
            } else if (filter === "happening") {
                return eventDate.toDateString() === now.toDateString(); // Đang diễn ra
            }
            return true; // Tất cả
        });

        setFilteredNotifications(filtered);
    }, [filter, notifications]);

    // Nhóm thông báo theo sự kiện
    const groupedNotifications = filteredNotifications.reduce(
        (acc, notification) => {
            const eventKey = `${notification.eventUser.event.eventType.eventTypeName
                } - ${new Date(
                    notification.eventUser.event.eventDate
                ).toLocaleDateString()}`;
            if (!acc[eventKey]) acc[eventKey] = [];
            acc[eventKey].push(notification);
            return acc;
        },
        {}
    );

    if (loading) return <div className="text-center">Đang tải...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Danh Sách Gửi Thông Báo</h2>
            {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
            )}


            {Object.entries(groupedNotifications).length === 0 ? (
                <div className="text-center text-muted">
                    Không có thông báo để hiển thị.
                </div>
            ) : (
                Object.entries(groupedNotifications).map(
                    ([eventKey, notifications], index) => (
                        <div key={index} className="card mb-4">
                            <div className="card-header bg-dark text-white">
                                <h5 className="mb-0">{eventKey}</h5>
                            </div>
                            <div className="card-body">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Người Phụ Trách</th>
                                            <th>Khách Hàng</th>
                                            <th>Thời Gian Gửi</th>
                                            <th>Nội Dung Thông Báo</th>
                                            <th>Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.map((notification, idx) => (
                                            <tr key={notification.notificationId}>
                                                <td>{idx + 1}</td>
                                                <td>{notification.eventUser.user.fullName}</td>
                                                <td>{notification.eventUser.customer.name}</td>
                                                <td>
                                                    {notification.sentAt
                                                        ? new Date(notification.sentAt).toLocaleString()
                                                        : "Chưa gửi"}
                                                </td>
                                                <td>{notification.message || "Chưa có nội dung"}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() =>
                                                            openModal(notification.notificationId)
                                                        }
                                                        disabled={notification.status === "Success"}
                                                    >
                                                        {notification.status === "Success"
                                                            ? "Đã gửi"
                                                            : "Gửi thông báo"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )
            )}

            {/* Modal Nhập Nội Dung */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Gửi Thông Báo</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="message" className="form-label">
                                        Nội Dung Thông Báo
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="message"
                                        rows="3"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Nhập nội dung thông báo..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSendNotification}
                                >
                                    Gửi Thông Báo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationList;
