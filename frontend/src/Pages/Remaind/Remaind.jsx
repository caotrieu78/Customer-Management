import React, { useEffect, useState } from "react";
import { getAllNotifications } from "../../services/eventNotificationServices";

function Remaind() {
    const [groupedNotifications, setGroupedNotifications] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getAllNotifications();

                // Nhóm thông báo theo sự kiện
                const grouped = data.reduce((acc, notification) => {
                    const eventName = notification.eventUser.event.eventType.eventTypeName;
                    const eventDate = notification.eventUser.event.eventDate;

                    const eventKey = `${eventName} - ${new Date(eventDate).toLocaleDateString()}`;
                    if (!acc[eventKey]) acc[eventKey] = [];
                    acc[eventKey].push(notification);
                    return acc;
                }, {});

                setGroupedNotifications(grouped);
            } catch (err) {
                setError("Không thể tải danh sách thông báo.");
            }
        };

        fetchNotifications();
    }, []);

    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="text-center">Danh Sách Thông Báo Theo Sự Kiện</h2>

            {Object.entries(groupedNotifications).map(([eventKey, notifications], index) => (
                <div key={index} className="mb-5">
                    <h3>{eventKey}</h3>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Người Phụ Trách</th>
                                <th>Khách Hàng</th>
                                <th>Trạng Thái Thông Báo</th>
                                <th>Hình Thức Thông Báo</th>
                                <th>Thời Gian Gửi</th>
                                <th>Nội Dung Thông Báo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((notification, idx) => (
                                <tr key={notification.notificationId}>
                                    <td>{idx + 1}</td>
                                    <td>{notification.eventUser.user.fullName}</td>
                                    <td>{notification.eventUser.customer.name}</td>
                                    <td>{notification.status}</td>
                                    <td>{notification.method}</td>
                                    <td>
                                        {notification.sentAt
                                            ? new Date(notification.sentAt).toLocaleString()
                                            : "Chưa gửi"}
                                    </td>
                                    <td>{notification.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

export default Remaind;




