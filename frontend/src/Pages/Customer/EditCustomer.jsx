import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomerById, updateCustomer } from "../../services/customerServices";
import { getAllUsers } from "../../services/authService"; // Import API to get users
import { PATHS } from "../../constant/pathnames";

function EditCustomer() {
    const { id } = useParams(); // Get customer ID from URL
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        classificationId: "",
        userId: "",
        dateOfBirth: "", // Added field for birthdate
    });

    const [users, setUsers] = useState([]); // List of responsible users (excluding Admin)
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch customer details and users on component mount
    useEffect(() => {
        const fetchCustomerAndUsers = async () => {
            try {
                // Fetch customer details
                const customer = await getCustomerById(id);
                setFormData({
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    classificationId: customer.classification?.classificationId || "",
                    userId: customer.user?.userId || "",
                    dateOfBirth: customer.dateOfBirth || "",
                });

                // Fetch list of users (excluding Admin)
                const usersData = await getAllUsers();
                const filteredUsers = usersData.filter((user) => user.role !== "Admin");
                setUsers(filteredUsers);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Unable to load customer or user information.");
            }
        };

        fetchCustomerAndUsers();
    }, [id]);

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateCustomer(id, formData);
            setSuccessMessage("Customer information updated successfully!");
            setTimeout(() => navigate(PATHS.CUSTOMER), 2000); // Redirect to customer list after 2 seconds
        } catch (err) {
            console.error("Error updating customer:", err);
            setError("Unable to update customer information.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Customer Information</h1>
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
                <div className="mb-3">
                    <label htmlFor="userId" className="form-label">
                        Responsible User
                    </label>
                    <select
                        className="form-select"
                        id="userId"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Responsible User</option>
                        {users.map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.fullName} ({user.role})
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">
                    Update Customer
                </button>
            </form>
        </div>
    );
}

export default EditCustomer;
