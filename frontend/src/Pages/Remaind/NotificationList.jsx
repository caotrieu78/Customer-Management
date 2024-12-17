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
    const [filter, setFilter] = useState("all"); // Filter for status: all, upcoming, past, happening
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [attachments, setAttachments] = useState([]); // State for multiple attachments
    const [unreadCount, setUnreadCount] = useState(0); // State to track unread notifications count

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.userId) {
                    throw new Error("Thông tin người dùng bị thiếu.");
                }

                const data = await getAllNotifications();

                // Filter notifications based on userId
                const filteredNotifications = data.filter(
                    (notification) => notification.eventUser.user.userId === user.userId
                );

                setNotifications(filteredNotifications);
                setFilteredNotifications(filteredNotifications);

                // Count unread notifications (assuming "Pending" status means unread)
                const unread = filteredNotifications.filter((notification) => notification.status !== "Success").length;
                setUnreadCount(unread);

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

            const formData = new FormData();
            formData.append("message", message);
            formData.append("sentAt", sentAt);

            // Add attachments to formData
            attachments.forEach((file, index) => {
                formData.append("attachments", file); // Append each file
            });

            // Send PUT request to backend
            const response = await sendNotification(selectedNotificationId, formData);

            // Check response from backend
            if (response.data && response.data.eventUser) {
                const customerName = response.data.eventUser.customer.name;
                setSuccessMessage(`Gửi thành công tới khách hàng ${customerName}!`);

                // Update notification state
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.notificationId === selectedNotificationId
                            ? { ...n, status: "Success", sentAt, message }
                            : n
                    )
                );

                // Close modal and reset fields
                setShowModal(false);
                setMessage("");
                setAttachments([]);

                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            }
        } catch (err) {
            console.error("Lỗi gửi thông báo: ", err);
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
        setAttachments([]);
    };

    // Filter notifications by status
    useEffect(() => {
        const now = new Date();
        const filtered = notifications.filter((notification) => {
            const eventDate = new Date(notification.eventUser.event.eventDate);

            if (filter === "upcoming") {
                return eventDate > now; // Upcoming
            } else if (filter === "past") {
                return eventDate < now; // Past
            } else if (filter === "happening") {
                return eventDate.toDateString() === now.toDateString(); // Happening
            }
            return true; // All
        });

        setFilteredNotifications(filtered);
    }, [filter, notifications]);

    const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
        const eventKey = `${notification.eventUser.event.eventType.eventTypeName} - ${new Date(notification.eventUser.event.eventDate).toLocaleDateString()}`;
        if (!acc[eventKey]) acc[eventKey] = [];
        acc[eventKey].push(notification);
        return acc;
    }, {});

    if (loading) return <div className="text-center">Đang tải...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-center align-items-center mb-4">
                <h2 className="text-center mb-0">Danh Sách Gửi Thông Báo</h2>
                <button className="btn btn-light bell-button">
                    <i className="bi bi-bell" style={{ fontSize: "1.5rem" }}></i>
                    {unreadCount > 0 && (
                        <span
                            className="position-absolute translate-middle rounded-pill bg-danger"
                            style={{
                                width: "20px", // adjust the size as needed
                                height: "20px",
                                color: "#fff", // adjust the size as needed
                                borderRadius: "50%", // makes the badge circular
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: "12px", // adjust the font size to fit inside the circle
                            }}
                        >
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>




            {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
            )}

            {/* Header with bell icon showing unread notifications */}
            <div className="position-relative">

            </div>

            {Object.entries(groupedNotifications).length === 0 ? (
                <div className="text-center text-muted">Không có thông báo để hiển thị.</div>
            ) : (
                Object.entries(groupedNotifications).map(([eventKey, notifications], index) => (
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
                ))
            )}

            {/* Modal to send notification */}
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
                                    <label htmlFor="message" className="form-label">Nội Dung Thông Báo</label>
                                    <textarea
                                        className="form-control"
                                        id="message"
                                        rows="3"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Nhập nội dung thông báo..."
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="attachments" className="form-label">
                                        Tệp đính kèm (hỗ trợ nhiều loại tệp)
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control mt-3"
                                        id="attachments"
                                        multiple
                                        onChange={(e) => setAttachments([...e.target.files])}
                                    />
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
                                    Gửi
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
