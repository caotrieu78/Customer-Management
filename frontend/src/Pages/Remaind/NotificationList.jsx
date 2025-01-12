import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import {
    getAllNotifications,
    getNotificationContent,
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
    const [attachments, setAttachments] = useState([]);
    const [isModalExpanded, setIsModalExpanded] = useState(false);
    const [expandedEvents, setExpandedEvents] = useState({});

    // Lấy danh sách thông báo từ backend
    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const data = await getAllNotifications();
                setNotifications(data);
            } catch (err) {
                setError("Không thể tải danh sách thông báo.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Nhóm thông báo theo sự kiện
    const groupNotificationsByEvent = (notifications) =>
        notifications.reduce((acc, notification) => {
            const eventKey = `${notification.eventUser.event.eventType.eventTypeName
                } (${new Date(
                    notification.eventUser.event.eventDate
                ).toLocaleDateString()})`;

            if (!acc[eventKey]) acc[eventKey] = [];
            acc[eventKey].push(notification);
            return acc;
        }, {});

    // Phân loại sự kiện
    const classifyEventsByDate = (groupedNotifications) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const todayEvents = {};
        const pastEvents = {};
        const upcomingEvents = {};

        Object.entries(groupedNotifications).forEach(
            ([eventKey, notifications]) => {
                const eventDate = new Date(
                    notifications[0].eventUser.event.eventDate
                ).setHours(0, 0, 0, 0);

                if (eventDate === today) {
                    todayEvents[eventKey] = notifications;
                } else if (eventDate < today) {
                    pastEvents[eventKey] = notifications;
                } else {
                    upcomingEvents[eventKey] = notifications;
                }
            }
        );

        return { todayEvents, pastEvents, upcomingEvents };
    };

    // Sắp xếp thông báo (ưu tiên chưa gửi)
    const sortNotifications = (notifications) => {
        const unsent = notifications.filter((n) => n.status !== "Success");
        const sent = notifications.filter((n) => n.status === "Success");
        return [...unsent, ...sent];
    };

    // Mở modal và lấy nội dung mẫu từ backend
    const openModal = async (notificationId) => {
        setSelectedNotificationId(notificationId);
        setShowModal(true);
        setLoading(true);

        try {
            const content = await getNotificationContent(notificationId);
            setMessage(content);
        } catch (err) {
            console.error("Không thể tải nội dung mẫu:", err);
            setError("Không thể tải nội dung mẫu.");
        } finally {
            setLoading(false);
        }
    };

    // Đóng modal
    const closeModal = () => {
        setShowModal(false);
        setMessage("");
        setAttachments([]);
    };

    // Xử lý chọn tệp đính kèm
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments((prev) => [...prev, ...files]); // Thêm tệp mới vào danh sách
    };

    // Xóa tệp đính kèm khỏi danh sách
    const handleRemoveAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    // Xử lý gửi thông báo
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

            attachments.forEach((file) => {
                formData.append("attachments", file);
            });

            await sendNotification(selectedNotificationId, formData);

            // Cập nhật trạng thái thông báo
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notificationId === selectedNotificationId
                        ? { ...n, status: "Success", sentAt, message }
                        : n
                )
            );

            setSuccessMessage("Thông báo đã gửi thành công!");
            closeModal();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error("Lỗi gửi thông báo:", err);
            setError("Không thể gửi thông báo. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Chuyển đổi trạng thái mở rộng/thu gọn
    const toggleEvent = (eventKey) => {
        setExpandedEvents((prev) => ({
            ...prev,
            [eventKey]: !prev[eventKey]
        }));
    };

    const groupedNotifications = groupNotificationsByEvent(notifications);
    const { todayEvents, pastEvents, upcomingEvents } =
        classifyEventsByDate(groupedNotifications);

    if (loading) return <div className="text-center">Đang tải...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    const renderEventGroup = (eventGroup, groupTitle) => {
        if (Object.keys(eventGroup).length === 0) return null;

        return (
            <>
                <h3 className="text-primary">{groupTitle}</h3>
                {Object.entries(eventGroup).map(([eventKey, notifications]) => {
                    const sortedNotifications = sortNotifications(notifications);
                    const unsentCount = sortedNotifications.filter(
                        (n) => n.status !== "Success"
                    ).length;

                    return (
                        <div key={eventKey} className="mb-4">
                            {/* Header sự kiện */}
                            <div
                                className="d-flex justify-content-between align-items-center"
                                style={{
                                    backgroundColor: "#343a40",
                                    color: "white",
                                    padding: "10px 15px",
                                    borderRadius: "5px",
                                    cursor: "pointer"
                                }}
                                onClick={() => toggleEvent(eventKey)}
                            >
                                <h5 className="mb-0">
                                    {eventKey}
                                    <span className="badge bg-danger mx-2">{unsentCount}</span>
                                </h5>
                                <span>{expandedEvents[eventKey] ? "−" : "+"}</span>
                            </div>

                            {/* Danh sách thông báo */}
                            {expandedEvents[eventKey] && (
                                <table className="table table-striped mt-2">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "5%" }}>#</th>
                                            <th style={{ width: "35%" }}>Khách Hàng</th>
                                            <th style={{ width: "20%" }}>Trạng Thái</th>
                                            <th style={{ width: "20%" }}>Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedNotifications.map((notification, idx) => (
                                            <tr key={notification.notificationId}>
                                                <td>{idx + 1}</td>
                                                <td>{notification.eventUser.customer.name}</td>
                                                <td
                                                    style={{
                                                        color:
                                                            notification.status === "Success"
                                                                ? "green"
                                                                : "red",
                                                        fontWeight: "bold"
                                                    }}
                                                >
                                                    {notification.status === "Success"
                                                        ? "Đã gửi"
                                                        : "Chưa gửi"}
                                                </td>
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
                            )}
                        </div>
                    );
                })}
            </>
        );
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center">Danh Sách Gửi Thông Báo</h2>

            {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
            )}

            {renderEventGroup(todayEvents, "Sự kiện hôm nay")}
            {renderEventGroup(upcomingEvents, "Sự kiện sắp tới")}
            {renderEventGroup(pastEvents, "Sự kiện đã qua")}

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div
                        className="modal-dialog"
                        style={{
                            maxWidth: isModalExpanded ? "90%" : "50%",
                            transition: "max-width 0.3s ease-in-out"
                        }}
                    >
                        <div className="modal-content">
                            <div
                                className="modal-header bg-primary text-white"
                                style={{ display: "flex", justifyContent: "space-between" }}
                            >
                                <h5 className="modal-title">Gửi Thông Báo</h5>
                                <div>
                                    <button
                                        style={{
                                            backgroundColor: "transparent",
                                            border: "none",
                                            fontSize: "20px",
                                            cursor: "pointer",
                                            color: "#fff"
                                        }}
                                        onClick={() => setIsModalExpanded(!isModalExpanded)}
                                    >
                                        {isModalExpanded ? "🗕" : "🗖"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        style={{ color: "#fff" }}
                                        onClick={closeModal}
                                    ></button>
                                </div>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="message" className="form-label">
                                        Nội dung thông báo
                                    </label>
                                    <Editor
                                        apiKey="shf3co6f6rpf87ruogtpgk6i4jifcq8mx5jysdr0k30kad2q"
                                        value={message}
                                        onEditorChange={(content) => setMessage(content)}
                                        init={{
                                            height: isModalExpanded ? 600 : 400,
                                            menubar: true,
                                            plugins: [
                                                "advlist autolink lists link image charmap print preview anchor",
                                                "searchreplace visualblocks code fullscreen",
                                                "insertdatetime media table paste code help wordcount"
                                            ],
                                            toolbar:
                                                "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help"
                                        }}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="attachments" className="form-label">
                                        Tệp đính kèm
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="attachments"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                    <ul className="mt-2">
                                        {attachments.map((file, index) => (
                                            <li
                                                key={index}
                                                className="d-flex justify-content-between"
                                            >
                                                <span>{file.name}</span>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleRemoveAttachment(index)}
                                                >
                                                    Xóa
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
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
