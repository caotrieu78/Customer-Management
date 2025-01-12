import React, { useState, useEffect } from "react";
import { getAllEventTypes, createEventType, updateEventType, deleteEventType } from "../../services/eventServices";

function EventTypes() {
    const [eventTypes, setEventTypes] = useState([]);  // Store event types
    const [error, setError] = useState("");  // Store error message
    const [showCreateModal, setShowCreateModal] = useState(false);  // Control create modal visibility
    const [showEditModal, setShowEditModal] = useState(false);    // Control edit modal visibility
    const [showDeleteModal, setShowDeleteModal] = useState(false);  // Control delete confirmation modal visibility
    const [selectedEventType, setSelectedEventType] = useState(null);  // Store the selected event type for edit/delete
    const [newEventType, setNewEventType] = useState({ name: "" });  // Store new event type data for creation

    useEffect(() => {
        // Fetch event types on component mount
        const fetchEventTypes = async () => {
            try {
                const data = await getAllEventTypes();  // API call to fetch event types
                setEventTypes(data);  // Store the event types in state
            } catch (err) {
                console.error("Error fetching event types:", err);
                setError("Unable to fetch event types.");
            }
        };

        fetchEventTypes();
    }, []);  // Empty dependency array ensures this runs once after the initial render

    const handleCreateEventType = async () => {
        // Logic for creating a new event type via API call
        try {
            const createdEvent = await createEventType({ eventTypeName: newEventType.name });
            setEventTypes([...eventTypes, createdEvent]);  // Add new event type to state
            setShowCreateModal(false);  // Close the modal after creation
        } catch (err) {
            console.error("Error creating event type:", err);
            setError("Failed to create event type.");
        }
    };

    const handleEditEventType = (id) => {
        const eventTypeToEdit = eventTypes.find((type) => type.eventTypeId === id);
        setSelectedEventType(eventTypeToEdit);
        setShowEditModal(true);  // Show the edit modal
    };

    const handleUpdateEventType = async () => {
        // Logic for updating event type via API call
        try {
            const updatedEvent = await updateEventType(selectedEventType.eventTypeId, {
                eventTypeName: selectedEventType.eventTypeName,
            });
            setEventTypes(eventTypes.map((type) =>
                type.eventTypeId === updatedEvent.eventTypeId ? updatedEvent : type
            ));
            setShowEditModal(false);  // Close the edit modal after update
        } catch (err) {
            console.error("Error updating event type:", err);
            setError("Failed to update event type.");
        }
    };

    const handleDeleteEventType = async () => {
        // Logic for deleting an event type via API call
        try {
            await deleteEventType(selectedEventType.eventTypeId);
            setEventTypes(eventTypes.filter((type) => type.eventTypeId !== selectedEventType.eventTypeId));  // Remove the deleted event from state
            setShowDeleteModal(false);  // Close the delete confirmation modal
        } catch (err) {
            console.error("Error deleting event type:", err);
            setError("Failed to delete event type.");
        }
    };

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (eventTypes.length === 0) {
        return <div className="alert alert-warning">No event types found.</div>;
    }

    return (
        <div>

            <h1 className="text-center mb-3">
                quản lý LOẠi sự kiện
            </h1>

            <button className="btn btn-primary mb-3" onClick={() => setShowCreateModal(true)}>
                <i class="bi bi-plus-square"></i>  Tạo Sự Kiện
            </button>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>Tên Sự Kiện</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventTypes.map((eventType) => (
                            <tr key={eventType.eventTypeId}>
                                <td>{eventType.eventTypeName}</td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => handleEditEventType(eventType.eventTypeId)}
                                    >
                                        <i class="bi bi-pencil-square"></i>  Sửa
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => {
                                            setSelectedEventType(eventType);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        <i class="bi bi-trash3"></i>  Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Event Type Modal */}
            <div className={`modal fade ${showCreateModal ? "show" : ""}`} style={{ display: showCreateModal ? "block" : "none" }} tabIndex="-1" aria-labelledby="createEventTypeModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="createEventTypeModalLabel">Create Event Type</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowCreateModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="eventName" className="form-label">Event Type Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="eventName"
                                    value={newEventType.name}
                                    onChange={(e) => setNewEventType({ name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setShowCreateModal(false)}><i class="bi bi-x-lg"></i> Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleCreateEventType}><i class="bi bi-plus-square"></i> Create</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Event Type Modal */}
            <div className={`modal fade ${showEditModal ? "show" : ""}`} style={{ display: showEditModal ? "block" : "none" }} tabIndex="-1" aria-labelledby="editEventTypeModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editEventTypeModalLabel">Edit Event Type</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowEditModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="editEventName" className="form-label">Event Type Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="editEventName"
                                    value={selectedEventType?.eventTypeName || ""}
                                    onChange={(e) =>
                                        setSelectedEventType({ ...selectedEventType, eventTypeName: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setShowEditModal(false)}><i class="bi bi-x-lg"></i>Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleUpdateEventType}><i class="bi bi-credit-card-fill"></i> Update</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Event Type Modal */}
            <div className={`modal fade ${showDeleteModal ? "show" : ""}`} style={{ display: showDeleteModal ? "block" : "none" }} tabIndex="-1" aria-labelledby="deleteEventTypeModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteEventTypeModalLabel">Delete Event Type</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowDeleteModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete this event type?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setShowDeleteModal(false)}><i class="bi bi-x-lg"></i> Close</button>
                            <button type="button" className="btn btn-danger" onClick={handleDeleteEventType}><i class="bi bi-trash3"></i> Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventTypes;
