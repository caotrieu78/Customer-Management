import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    getAllEvents,
    deleteEvent,
    createEvent,
    updateEvent,
    getAllEventTypes,
} from "../../services/eventServices";
import { PATHS } from "../../constant/pathnames";

function Event() {
    const [events, setEvents] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false); // State for loading
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);

    // Add/Edit form state
    const [formData, setFormData] = useState({
        eventTypeId: "",
        description: "",
        eventDate: "",
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [eventData, eventTypeData] = await Promise.all([
                    getAllEvents(),
                    getAllEventTypes(),
                ]);
                setEvents(eventData);
                setEventTypes(eventTypeData);
            } catch (err) {
                setError("Không thể tải dữ liệu sự kiện hoặc loại sự kiện.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!formData.eventTypeId || !formData.eventDate || !formData.description) {
            setError("Vui lòng điền đầy đủ thông tin.");
            setTimeout(() => setError(""), 2000); // Clear error after 2 seconds
            return;
        }

        const eventPayload = {
            eventType: { eventTypeId: parseInt(formData.eventTypeId) },
            description: formData.description,
            eventDate: formData.eventDate,
        };

        setLoading(true);
        try {
            if (editingEventId) {
                // Update existing event
                const updatedEvent = await updateEvent(editingEventId, eventPayload);
                setEvents((prevEvents) =>
                    prevEvents.map((event) =>
                        event.eventId === editingEventId ? updatedEvent : event
                    )
                );
                setSuccessMessage("Sự kiện đã được cập nhật thành công!");
            } else {
                // Add new event
                const newEvent = await createEvent(eventPayload);
                const eventType = eventTypes.find(
                    (type) => type.eventTypeId === parseInt(formData.eventTypeId)
                );
                setEvents((prevEvents) => [{ ...newEvent, eventType }, ...prevEvents]);
                setSuccessMessage("Sự kiện đã được thêm thành công!");
            }

            setShowAddModal(false);
            setFormData({ eventTypeId: "", description: "", eventDate: "" });
            setEditingEventId(null);

            // Automatically clear success message after 2 seconds
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            setError("Không thể thêm hoặc cập nhật sự kiện. Vui lòng thử lại.");
            setTimeout(() => setError(""), 2000); // Clear error after 2 seconds
        } finally {
            setLoading(false);
        }
    };


    const handleEdit = (event) => {
        setEditingEventId(event.eventId);
        setFormData({
            eventTypeId: event.eventType?.eventTypeId || "",
            description: event.description,
            eventDate: event.eventDate,
        });
        setShowAddModal(true);
    };
    const confirmDelete = (eventId) => {
        setEventToDelete(eventId);
    };

    const handleDelete = async () => {
        try {
            await deleteEvent(eventToDelete);
            setEvents((prevEvents) => prevEvents.filter((event) => event.eventId !== eventToDelete));
            setSuccessMessage("Sự kiện đã được xóa thành công!");
            setEventToDelete(null);
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            console.error("Error deleting event:", err);
            setError("Không thể xóa sự kiện. Vui lòng thử lại.");
        }
    };




    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

    const totalPages = Math.ceil(events.length / eventsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    return (
        <div className="container">
            {loading && <div className="spinner-border text-primary" role="status"></div>}
            {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Danh sách Sự kiện</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setShowAddModal(true);
                        setEditingEventId(null);
                        setFormData({ eventTypeId: "", description: "", eventDate: "" });
                    }}
                >
                    Thêm Sự kiện
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Tên Sự kiện</th>
                            <th>Mô tả</th>
                            <th>Ngày Diễn ra</th>
                            <th>Trạng Thái Sự Kiện</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEvents.map((event) => (
                            <tr key={event.eventId}>
                                <td>{event.eventId}</td>
                                <td>{event.eventType?.eventTypeName || "N/A"}</td>
                                <td>{event.description}</td>
                                <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                                <td>{event.status}</td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => handleEdit(event)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm me-2"
                                        onClick={() => confirmDelete(event.eventId)}
                                    >
                                        Xóa
                                    </button>

                                    <NavLink
                                        to={`${PATHS.EVENT_DETAIL}/${event.eventId}`}
                                        className="btn btn-primary btn-sm me-2"
                                    >
                                        Phân Công Người Phụ Trách
                                    </NavLink>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-center align-items-center mt-3">
                <button
                    className="btn btn-secondary"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="mx-2">Page {currentPage} of {totalPages}</span>
                <button
                    className="btn btn-secondary"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>

            {/* Modal for Add/Edit Event */}
            {showAddModal && (
                <div className="modal fade show" style={{ display: "block" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleAddEvent}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingEventId ? "Sửa Sự kiện" : "Thêm Sự kiện"}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAddModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="eventTypeId">Loại Sự kiện</label>
                                        <select
                                            className="form-select"
                                            id="eventTypeId"
                                            name="eventTypeId"
                                            value={formData.eventTypeId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Chọn loại sự kiện</option>
                                            {eventTypes.map((type) => (
                                                <option key={type.eventTypeId} value={type.eventTypeId}>
                                                    {type.eventTypeName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description">Mô tả</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="3"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="eventDate">Ngày Diễn ra</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="eventDate"
                                            name="eventDate"
                                            value={formData.eventDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingEventId ? "Cập nhật" : "Thêm"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {eventToDelete && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Xác nhận xóa</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setEventToDelete(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Bạn có chắc chắn muốn xóa sự kiện này?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEventToDelete(null)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Event;
