import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    getEventById,
    assignUserAndCustomerToEvent,
    getEventUsersByEventId,
    getAvailableCustomersForEvent
} from "../../services/eventServices";
import { getAllUsers } from "../../services/authService";

function EventDetails() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]); // For customer search
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [customerSearchText, setCustomerSearchText] = useState(""); // Search state for customers
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showUserPopup, setShowUserPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventData, allUsers, eventUsers, availableCustomers] =
                    await Promise.all([
                        getEventById(eventId),
                        getAllUsers(),
                        getEventUsersByEventId(eventId),
                        getAvailableCustomersForEvent(eventId)
                    ]);

                const assignedCustomerIds = eventUsers.map(
                    (user) => user.customer?.customerId
                );

                const filteredCustomers = availableCustomers.filter(
                    (customer) => !assignedCustomerIds.includes(customer.customerId)
                );

                setEvent({
                    ...eventData,
                    assignedUsers: eventUsers
                });
                setUsers(allUsers.filter((user) => user.role !== "Admin"));
                setFilteredUsers(allUsers.filter((user) => user.role !== "Admin"));
                setCustomers(filteredCustomers);
                setFilteredCustomers(filteredCustomers); // Initialize filtered customers
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    const toggleCustomerSelection = (customerId) => {
        setSelectedCustomers((prevSelected) =>
            prevSelected.includes(customerId)
                ? prevSelected.filter((id) => id !== customerId)
                : [...prevSelected, customerId]
        );
    };

    const handleAssignUserAndCustomer = async () => {
        if (!selectedUser || selectedCustomers.length === 0) {
            alert("Vui lòng chọn một người phụ trách và ít nhất một khách hàng.");
            return;
        }

        try {
            const assignments = await Promise.all(
                selectedCustomers.map((customerId) =>
                    assignUserAndCustomerToEvent(eventId, selectedUser.userId, customerId)
                )
            );

            setEvent((prevEvent) => ({
                ...prevEvent,
                assignedUsers: [...(prevEvent?.assignedUsers || []), ...assignments]
            }));

            setCustomers((prevCustomers) =>
                prevCustomers.filter(
                    (customer) => !selectedCustomers.includes(customer.customerId)
                )
            );

            setSelectedCustomers([]);
            setSelectedUser(null);
            setShowModal(false);
        } catch (err) {
            console.error("Error assigning users and customers:", err);
        }
    };

    const handleCustomerSearch = (text) => {
        setCustomerSearchText(text);
        setFilteredCustomers(
            customers.filter((customer) =>
                customer.name.toLowerCase().includes(text.toLowerCase())
            )
        );
    };

    const handleSearch = (text) => {
        setSearchText(text);
        setFilteredUsers(
            users.filter((user) =>
                user.fullName.toLowerCase().includes(text.toLowerCase())
            )
        );
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCustomers([]);
        setSelectedUser(null);
    };

    if (isLoading) return <div className="text-center my-5">Đang tải...</div>;

    return (
        <div className="container ">
            {/* Header Section */}
            <div
                className="text-center p-4 mb-4 rounded shadow"

            >
                <h1 style={{ fontWeight: "bold", fontSize: "2.5rem" }}>
                    Thông Tin Về Sự Kiện
                </h1>
            </div>

            {/* Event Info Section */}
            <div className="card shadow-lg mb-5">
                <div className="card-body">
                    <h5>
                        <strong>Loại sự kiện:</strong> {event.eventType?.eventTypeName}
                    </h5>
                    <p>
                        <strong>Ngày:</strong>{" "}
                        {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                    <p>
                        <strong>Mô tả:</strong> {event.description}
                    </p>
                </div>
            </div>

            {/* User Assignment Section */}
            <h3
                className="mb-4"
                style={{ fontWeight: "bold", color: "#374151", textAlign: "center" }}
            >
                Danh Sách Phụ Trách và Khách Hàng
            </h3>
            <table className="table table-hover table-striped shadow-sm">
                <thead className="bg-primary text-white">
                    <tr>
                        <th>#</th>
                        <th>Người Phụ Trách</th>
                        <th>Vai Trò</th>
                        <th>Khách Hàng</th>
                    </tr>
                </thead>
                <tbody>
                    {event?.assignedUsers?.map((assignedUser, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{assignedUser.user?.fullName}</td>
                            <td>{assignedUser.user?.role}</td>
                            <td>{assignedUser.customer?.name || "Chưa Gán"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                className="btn btn-primary mt-3"
                onClick={() => setShowModal(true)}
            >
                <i className="bi bi-people-fill"></i> Gán Người Phụ Trách và Khách Hàng
            </button>

            {/* Main Modal */}
            {showModal && (
                <div
                    className="modal"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 1050
                    }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <i className="bi bi-people-fill"></i> Gán Người Phụ Trách và Khách Hàng
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <h5 className="text-primary mb-3">Danh Sách Khách Hàng</h5>

                                {/* Customer Search */}
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="Tìm kiếm khách hàng..."
                                    value={customerSearchText}
                                    onChange={(e) => handleCustomerSearch(e.target.value)}
                                />

                                <ul className="list-group mb-3">
                                    {filteredCustomers.map((customer) => (
                                        <li
                                            key={customer.customerId}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCustomers.includes(
                                                        customer.customerId
                                                    )}
                                                    onChange={() =>
                                                        toggleCustomerSelection(customer.customerId)
                                                    }
                                                />
                                                <span className="ms-2">{customer.name}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className="btn btn-secondary mb-3"
                                    onClick={() => setShowUserPopup(true)}
                                >
                                    <i className="bi bi-person-check"></i> Chọn Người Phụ Trách
                                </button>
                                {selectedUser && (
                                    <div className="alert alert-info">
                                        <strong>Người Phụ Trách:</strong> {selectedUser.fullName}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setShowModal(false)}
                                >
                                    <i className="bi bi-x-lg"></i> Đóng
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={handleAssignUserAndCustomer}
                                >
                                    <i className="bi bi-check-circle"></i> Xác Nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Selection Popup */}
            {showUserPopup && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 1050,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#fff",
                            padding: "20px",
                            borderRadius: "10px",
                            width: "50%",
                            maxWidth: "500px",
                            boxShadow: "0 0 10px rgba(0,0,0,0.3)"
                        }}
                    >
                        <h5 className="mb-3 text-center">Tìm kiếm người phụ trách</h5>
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Tìm kiếm..."
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <ul className="list-group">
                            {filteredUsers.map((user) => (
                                <li
                                    key={user.userId}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    {user.fullName}
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowUserPopup(false);
                                        }}
                                    >
                                        Chọn
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="text-end mt-3">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowUserPopup(false)}
                            >
                                Quay Lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventDetails;
