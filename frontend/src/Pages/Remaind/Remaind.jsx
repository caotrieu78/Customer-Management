import React, { useState, useEffect } from "react";
import { getAllNotifications } from "../../services/eventNotificationServices";

function Remaind() {
    const [notifications, setNotifications] = useState([]);
    const [groupedNotifications, setGroupedNotifications] = useState({});
    const [error, setError] = useState("");
    const [expandedSections, setExpandedSections] = useState({});
    const [sortType, setSortType] = useState("all");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getAllNotifications();
                console.log("API Response: ", data);

                const filteredData = data.filter(
                    (notification) =>
                        notification.eventUser &&
                        notification.eventUser.event &&
                        notification.eventUser.event.eventType &&
                        notification.eventUser.user &&
                        notification.eventUser.customer
                );

                setNotifications(filteredData);
                groupNotifications(filteredData);
            } catch (err) {
                console.error("API Error: ", err);
                setError("Không thể tải danh sách thông báo.");
            }
        };


        fetchNotifications();
    }, []);

    const groupNotifications = (data) => {
        const grouped = data.reduce((acc, notification) => {
            const eventName =
                notification.eventUser.event.eventType.eventTypeName ||
                "Không xác định";
            const eventDate =
                notification.eventUser.event.eventDate || "Không xác định";

            const eventKey = `${eventName} - ${eventDate !== "Không xác định"
                ? new Date(eventDate).toLocaleDateString()
                : "Không xác định"
                }`;

            if (!acc[eventKey]) acc[eventKey] = [];
            acc[eventKey].push(notification);
            return acc;
        }, {});

        setGroupedNotifications(grouped);
    };

    const handleSort = (type) => {
        setSortType(type);

        const now = new Date();
        const filteredNotifications = notifications.filter((notification) => {
            const eventDate = new Date(notification.eventUser.event.eventDate);

            if (type === "upcoming") {
                return eventDate > now; // Sự kiện sắp tới
            } else if (type === "past") {
                return eventDate < now; // Sự kiện đã diễn ra
            } else if (type === "happening") {
                return eventDate.toDateString() === now.toDateString(); // Sự kiện đang diễn ra
            }
            return true; // Tất cả sự kiện
        });

        groupNotifications(filteredNotifications);
    };

    const toggleSection = (key) => {
        setExpandedSections((prevState) => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };

    const styles = {
        container: {
            maxWidth: "1200px",
            margin: "20px auto",
            fontFamily: "'Roboto', sans-serif",
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)"
        },
        title: {
            textAlign: "center",
            marginBottom: "20px",
            color: "#4a4a4a",
            fontSize: "30px",
            fontWeight: "700"
        },
        sortButtons: {
            textAlign: "center",
            marginBottom: "20px"
        },
        button: {
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            margin: "0 5px",
            fontSize: "16px",
            transition: "background-color 0.3s ease"
        },
        activeButton: {
            backgroundColor: "#0056b3"
        },
        card: {
            marginBottom: "20px",
            borderRadius: "10px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            backgroundColor: "#f9f9f9"
        },
        cardHeader: {
            padding: "15px 20px",
            backgroundColor: "#333",
            color: "white",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "background-color 0.3s ease"
        },
        eventTitle: {
            margin: 0,
            fontSize: "18px",
            fontWeight: "600"
        },
        toggleIcon: {
            fontSize: "20px",
            fontWeight: "bold",
            transition: "transform 0.3s ease"
        },
        toggleIconOpen: {
            transform: "rotate(90deg)"
        },
        cardBody: {
            padding: "15px 20px",
            backgroundColor: "#ffffff",
            maxHeight: 0,
            overflow: "hidden",
            transition: "max-height 0.5s ease"
        },
        cardBodyExpanded: {
            maxHeight: "500px"
        },
        table: {
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0px 10px",
            textAlign: "center",
            marginTop: "10px"
        },
        tableHead: {
            backgroundColor: "#007bff",
            color: "white",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "bold"
        },
        tableRow: {
            backgroundColor: "#f7f7f7",
            transition: "background-color 0.3s ease",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)"
        },
        badgePending: {
            backgroundColor: "#ffc107",
            color: "black",
            padding: "5px 10px",
            borderRadius: "5px",
            fontWeight: "bold"
        },
        badgeSuccess: {
            backgroundColor: "#28a745",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontWeight: "bold"
        },
        badgeError: {
            backgroundColor: "#dc3545",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontWeight: "bold"
        }
    };

    if (error) return <div style={styles.error}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Danh Sách Thông Báo Theo Sự Kiện</h2>

            <div style={styles.sortButtons}>
                <button
                    style={{
                        ...styles.button,
                        ...(sortType === "all" ? styles.activeButton : {})
                    }}
                    onClick={() => handleSort("all")}
                >
                    Tất Cả
                </button>
                <button
                    style={{
                        ...styles.button,
                        ...(sortType === "happening" ? styles.activeButton : {})
                    }}
                    onClick={() => handleSort("happening")}
                >
                    Đang Diễn Ra
                </button>
                <button
                    style={{
                        ...styles.button,
                        ...(sortType === "upcoming" ? styles.activeButton : {})
                    }}
                    onClick={() => handleSort("upcoming")}
                >
                    Sắp Tới
                </button>
                <button
                    style={{
                        ...styles.button,
                        ...(sortType === "past" ? styles.activeButton : {})
                    }}
                    onClick={() => handleSort("past")}
                >
                    Đã Diễn Ra
                </button>
            </div>

            {Object.entries(groupedNotifications).map(
                ([eventKey, notifications], index) => (
                    <div key={index} style={styles.card}>
                        <div
                            style={{
                                ...styles.cardHeader,
                                ...(expandedSections[eventKey]
                                    ? { backgroundColor: "#555" }
                                    : {})
                            }}
                            onClick={() => toggleSection(eventKey)}
                        >
                            <h5 style={styles.eventTitle}>
                                {eventKey} <span>({notifications.length} thông báo)</span>
                            </h5>
                            <span
                                style={{
                                    ...styles.toggleIcon,
                                    ...(expandedSections[eventKey] ? styles.toggleIconOpen : {})
                                }}
                            >
                                ▶
                            </span>
                        </div>
                        <div
                            style={{
                                ...styles.cardBody,
                                ...(expandedSections[eventKey] ? styles.cardBodyExpanded : {})
                            }}
                        >
                            <table style={styles.table}>
                                <thead style={styles.tableHead}>
                                    <tr>
                                        <th>#</th>
                                        <th>Người Phụ Trách</th>
                                        <th>Khách Hàng</th>
                                        <th>Trạng Thái</th>
                                        <th>Hình Thức</th>
                                        <th>Thời Gian Gửi</th>
                                        <th>Nội Dung</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((notification, idx) => (
                                        <tr key={idx} style={styles.tableRow}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                {notification.eventUser.user.fullName ||
                                                    "Không xác định"}
                                            </td>
                                            <td>
                                                {notification.eventUser.customer.name ||
                                                    "Không xác định"}
                                            </td>
                                            <td>
                                                <span
                                                    style={
                                                        notification.status === "Pending"
                                                            ? styles.badgePending
                                                            : notification.status === "Success"
                                                                ? styles.badgeSuccess
                                                                : styles.badgeError
                                                    }
                                                >
                                                    {notification.status || "Không xác định"}
                                                </span>
                                            </td>
                                            <td>{notification.method || "Không xác định"}</td>
                                            <td>
                                                {notification.sentAt
                                                    ? new Date(notification.sentAt).toLocaleString()
                                                    : "Chưa gửi"}
                                            </td>
                                            <td>{notification.message || "Không có nội dung"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default Remaind;
