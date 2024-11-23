import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "../../services/customerServices";
import { PATHS } from "../../constant/pathnames";

function AddCustomer() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        classificationId: "",
        dateOfBirth: "", // Added field for birthdate
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCustomer(formData); // Send data to backend
            setSuccessMessage("Customer added successfully!");
            setTimeout(() => navigate(PATHS.CUSTOMER), 2000); // Redirect to customer list after 2 seconds
        } catch (err) {
            console.error("Error adding customer:", err);
            setError("Unable to add customer.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add Customer</h1>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Customer Name
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Email
                    </label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                        Phone
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="address" className="form-label">
                        Address
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="classificationId" className="form-label">
                        Classification
                    </label>
                    <select
                        className="form-select"
                        id="classificationId"
                        name="classificationId"
                        value={formData.classificationId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Classification</option>
                        <option value="1">VIP</option>
                        <option value="2">Normal</option>
                        <option value="3">Potential</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="dateOfBirth" className="form-label">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        className="form-control"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Add Customer
                </button>
            </form>
        </div>
    );
}

export default AddCustomer;
