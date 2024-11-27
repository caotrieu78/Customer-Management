import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    getEventById,
    assignUserAndCustomerToEvent,
    getEventUsersByEventId,
    getAvailableCustomersForEvent,
} from "../../services/eventServices";
import { getAllUsers } from "../../services/authService";

function EventDetails() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const eventData = await getEventById(eventId);
                setEvent(eventData);
            } catch (err) {
                setError("Unable to fetch event details.");
            }
        };

        const fetchUsers = async () => {
            try {
                const allUsers = await getAllUsers();
                setUsers(allUsers.filter((user) => user.role !== "Admin"));
            } catch (err) {
                setError("Unable to fetch users.");
            }
        };

        const fetchEventUsers = async () => {
            try {
                const eventUsers = await getEventUsersByEventId(eventId);
                setEvent((prevEvent) => ({
                    ...prevEvent,
                    assignedUsers: eventUsers,
                }));
            } catch (err) {
                setError("Unable to fetch assigned users.");
            }
        };

        fetchEventDetails();
        fetchUsers();
        fetchEventUsers();
        fetchCustomers(eventId);
    }, [eventId]);

    const fetchCustomers = async (eventId) => {
        try {
            const availableCustomers = await getAvailableCustomersForEvent(eventId);
            setCustomers(availableCustomers);
        } catch (err) {
            setError("Unable to fetch available customers.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCustomerSelection = (customerId) => {
        setSelectedCustomers((prevSelected) =>
            prevSelected.includes(customerId)
                ? prevSelected.filter((id) => id !== customerId) // Bỏ chọn nếu đã chọn
                : [...prevSelected, customerId] // Thêm vào nếu chưa chọn
        );
    };

    const handleAssignUserAndCustomer = async (userId) => {
        if (selectedCustomers.length === 0) {
            setError("Please select at least one customer.");
            return;
        }
        try {
            const assignments = await Promise.all(
                selectedCustomers.map((customerId) =>
                    assignUserAndCustomerToEvent(eventId, userId, customerId)
                )
            );

            // Cập nhật danh sách `assignedUsers` ngay lập tức
            setEvent((prevEvent) => ({
                ...prevEvent,
                assignedUsers: [...(prevEvent?.assignedUsers || []), ...assignments],
            }));

            // Hiển thị thông báo thành công
            setSuccessMessage("Assignment successful!");
            setError("");
            fetchCustomers(eventId); // Cập nhật danh sách khách hàng khả dụng
            setSelectedCustomers([]); // Reset danh sách khách hàng đã chọn
            setTimeout(() => {
                setSuccessMessage(""); // Xóa thông báo sau vài giây
                setShowModal(false);
            }, 2000);
        } catch (err) {
            setError("Unable to assign user and customers to event.");
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setError("");
        setSelectedCustomers([]);
    };

    if (isLoading) return <div className="text-center my-5">Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-5">
            <div className="text-center">
                <h1 className="display-4">Thông Tin Về Sự Kiện</h1>
            </div>
            <div className="card shadow mt-4">
                <div className="card-body">
                    <h4 className="card-title">
                        Thời Gian Diễn Ra Sự Kiện -{" "}
                        <span className="text-primary">{event.eventType?.eventTypeName}</span>
                    </h4>
                    <p className="card-text">
                        <strong>Vào Ngày:</strong> {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                    <p className="card-text">
                        <strong>Mô Tả Về Sự Kiện:</strong> {event.description}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <h3>Phụ Trách và Khách Hàng</h3>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Người Phụ Trách</th>
                            <th>Vai Trò</th>
                            <th>Khách Hàng</th>
                            <th>Trạng Thái Thông Báo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {event?.assignedUsers?.map((assignedUser, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{assignedUser.user?.fullName}</td>
                                <td>{assignedUser.user?.role}</td>
                                <td>{assignedUser.customer?.name || "Chưa Gán"}</td>
                                <td>{event.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="text-center mt-4">
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowModal(true)}
                >
                    Gán Người Phụ Trách và Khách Hàng
                </button>
            </div>

            {showModal && (
                <div className="modal fade show" tabIndex="-1" style={{ display: "block" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Gán Người Phụ Trách và Khách Hàng</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {successMessage && (
                                    <div className="alert alert-success">{successMessage}</div>
                                )}
                                {error && <div className="alert alert-danger">{error}</div>}

                                <h5>Danh Sách Khách Hàng Chưa Tham Gia</h5>
                                <ul className="list-group mb-3">
                                    {customers.length > 0 ? (
                                        customers.map((customer) => (
                                            <li
                                                key={customer.customerId}
                                                className="list-group-item d-flex justify-content-between align-items-center"
                                            >
                                                <div>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input me-2"
                                                        checked={selectedCustomers.includes(customer.customerId)}
                                                        onChange={() => toggleCustomerSelection(customer.customerId)}
                                                    />
                                                    <strong>{customer.name}</strong> - {customer.email || "Không có email"}
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="list-group-item text-center text-muted">
                                            Không còn khách hàng nào khả dụng.
                                        </li>
                                    )}
                                </ul>

                                <h5>Danh Sách Người Phụ Trách</h5>
                                <ul className="list-group">
                                    {users.map((user) => (
                                        <li
                                            key={user.userId}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            {user.fullName} ({user.role})
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleAssignUserAndCustomer(user.userId)}
                                                disabled={selectedCustomers.length === 0}
                                            >
                                                Gán
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default EventDetails;
