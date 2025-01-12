import React, { useState, useEffect } from "react";
import { getAllNotifications } from "../../services/eventNotificationServices";

// Component Modal để hiển thị nội dung chi tiết
const NotificationModal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    const styles = {
        modalBackdrop: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        modalContent: {
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80%",
            overflowY: "auto"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px"
        },
        closeButton: {
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer"
        },
        contentBody: {
            fontSize: "16px",
            lineHeight: "1.6"
        },
        copyButton: {
            marginTop: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer"
        }
    };

    // Hàm copy nội dung dạng text thuần (plain text)
    const copyToClipboard = () => {
        const tempElement = document.createElement("div");
        tempElement.innerHTML = content;
        const plainText = tempElement.textContent || tempElement.innerText || "";

        navigator.clipboard.writeText(plainText).then(() => {
            alert("Nội dung đã được copy vào clipboard!");
        });
    };

    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click bubble
            >
                <div style={styles.header}>
                    <h4>Nội dung chi tiết</h4>
                    <button style={styles.closeButton} onClick={onClose}>
                        Đóng
                    </button>
                </div>
                <div
                    style={styles.contentBody}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
                <button style={styles.copyButton} onClick={copyToClipboard}>
                    Copy nội dung
                </button>
            </div>
        </div>
    );
};

// Component chính: Remaind
function Remaind() {
    const [notifications, setNotifications] = useState([]);
    const [groupedNotifications, setGroupedNotifications] = useState({});
    const [error, setError] = useState("");
    const [expandedSections, setExpandedSections] = useState({});
    const [sortType, setSortType] = useState("all"); // Trạng thái lọc
    const [selectedEmail, setSelectedEmail] = useState(""); // Nội dung email được chọn
    const [showModal, setShowModal] = useState(false); // Trạng thái hiển thị modal
    const [hoveredRow, setHoveredRow] = useState(null); // Trạng thái hover trên hàng

    const decodeHtmlEntities = (str) => {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = str;
        return textarea.value;
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getAllNotifications();

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

    const handleOpenEmail = (notification) => {
        const decodedMessage = decodeHtmlEntities(notification.message);
        setSelectedEmail(decodedMessage);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEmail("");
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
        filterButtons: {
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            gap: "10px"
        },
        button: {
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background-color 0.3s ease"
        },
        activeButton: {
            backgroundColor: "#0056b3"
        },
        card: {
            marginBottom: "20px",
            borderRadius: "10px",
            overflow: "hidden"
        },
        cardHeader: {
            padding: "15px 20px",
            backgroundColor: "#343a40",
            color: "white",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold"
        },
        link: {
            color: "#007bff",
            textDecoration: "none",
            cursor: "pointer",
            transition: "color 0.3s ease"
        },
        linkHover: {
            color: "#0056b3",
            textDecoration: "underline"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
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
            transition: "background-color 0.3s ease"
        },
        tableRowHover: {
            backgroundColor: "#e9ecef" // Thêm màu highlight khi hover
        },
        badge: {
            padding: "5px 10px",
            borderRadius: "5px",
            fontWeight: "bold",
            display: "inline-block",
            minWidth: "70px",
            textAlign: "center",
            color: "white"
        }
    };

    const getBadgeStyle = (status) => {
        if (status === "Success") {
            return { ...styles.badge, backgroundColor: "#28a745" }; // Xanh lá
        } else if (status === "Pending") {
            return { ...styles.badge, backgroundColor: "#ffc107", color: "black" }; // Vàng
        } else {
            return { ...styles.badge, backgroundColor: "#dc3545" }; // Đỏ
        }
    };

    if (error) return <div style={styles.error}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Danh Sách Thông Báo Theo Sự Kiện</h2>

            {/* Nút lọc sự kiện */}
            <div style={styles.filterButtons}>
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

            {/* Danh sách sự kiện */}
            {Object.entries(groupedNotifications).map(
                ([eventKey, notifications], index) => {
                    const totalNotifications = notifications.length;
                    const sentNotifications = notifications.filter(
                        (notification) => notification.sentAt
                    ).length;

                    return (
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
                                <h5>
                                    {eventKey} (Tổng: {totalNotifications}, Đã gửi:{" "}
                                    {sentNotifications})
                                </h5>
                                <span>{expandedSections[eventKey] ? "-" : "+"}</span>
                            </div>


                            {expandedSections[eventKey] && (
                                <div className="table-responsive">
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
                                                <tr
                                                    key={idx}
                                                    style={{
                                                        ...styles.tableRow,
                                                        ...(hoveredRow === idx ? styles.tableRowHover : {})
                                                    }}
                                                    onMouseEnter={() => setHoveredRow(idx)}
                                                    onMouseLeave={() => setHoveredRow(null)}
                                                >
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
                                                        <span style={getBadgeStyle(notification.status)}>
                                                            {notification.status || "Không xác định"}
                                                        </span>
                                                    </td>
                                                    <td>{notification.method || "Không xác định"}</td>
                                                    <td>
                                                        {notification.sentAt
                                                            ? new Date(notification.sentAt).toLocaleString()
                                                            : "Chưa gửi"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            style={{
                                                                ...styles.link,
                                                                ...(hoveredRow === idx ? styles.linkHover : {})
                                                            }}
                                                            onClick={() => handleOpenEmail(notification)}
                                                        >
                                                            Xem nội dung
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}


                        </div>
                    );
                }
            )}

            {/* Modal hiển thị nội dung chi tiết */}
            <NotificationModal
                isOpen={showModal}
                onClose={handleCloseModal}
                content={selectedEmail}
            />
        </div>
    );
}

export default Remaind;
