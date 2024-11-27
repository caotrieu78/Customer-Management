import React, { useState, useEffect } from "react";
import { getAllEventTypes } from "../../services/eventServices";

function EventTypes() {
    const [eventTypes, setEventTypes] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        // Gọi API để lấy tất cả loại sự kiện
        const fetchEventTypes = async () => {
            try {
                const data = await getAllEventTypes();  // Lấy dữ liệu loại sự kiện
                setEventTypes(data);
            } catch (err) {
                console.error("Error fetching event types:", err);
                setError("Unable to fetch event types.");
            }
        };

        fetchEventTypes();
    }, []);  // Chỉ gọi khi component được render lần đầu

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (eventTypes.length === 0) {
        return <div className="alert alert-warning">No event types found.</div>;
    }

    return (
        <div>
            <h2>Event Types</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventTypes.map((eventType) => (
                            <tr key={eventType.eventTypeId}>
                                <td>{eventType.eventTypeId}</td>
                                <td>{eventType.name}</td>
                                <td>{eventType.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EventTypes;
