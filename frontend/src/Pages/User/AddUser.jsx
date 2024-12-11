import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, assignPermissionToUser, getAllPermissions } from "../../services/authService";
import { PATHS } from "../../constant/pathnames";

function AddUser() {
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        role: "",
        password: "",
    });
    const [permissions, setPermissions] = useState([]);
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showPermissionsModal, setShowPermissionsModal] = useState(false); // Modal visibility
    const navigate = useNavigate();

    // Fetch permissions on component mount
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const data = await getAllPermissions();
                setAvailablePermissions(data); // Set permissions from API
            } catch (err) {
                console.error("Failed to fetch permissions:", err);
            }
        };
        fetchPermissions();
    }, []);

    // Handle input changes for user fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle permission selection
    const handlePermissionChange = (e) => {
        const { value, checked } = e.target;
        const updatedPermissions = checked
            ? [...permissions, parseInt(value)]
            : permissions.filter((permissionId) => permissionId !== parseInt(value));
        setPermissions(updatedPermissions);
    };

    // Submit form and assign permissions
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create user
            const newUser = await createUser(formData);

            // Assign permissions
            if (permissions.length > 0) {
                await assignPermissionToUser(newUser.userId, permissions);
            }

            setMessage("User added successfully with assigned permissions!");
            setError("");
            setTimeout(() => {
                navigate(PATHS.USER);
            }, 1000);
        } catch (err) {
            console.error("Error adding user or assigning permissions:", err);
            setError("Failed to add user or assign permissions. Please try again.");
            setMessage("");
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Add User</h1>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select
                        className="form-select"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                    </select>
                </div>

                {/* Button to open modal */}
                <div className="mb-3">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowPermissionsModal(true)}
                    >
                        Assign Permissions
                    </button>
                </div>

                {/* Display selected permissions below */}
                {permissions.length > 0 && (
                    <div className="mb-3">
                        <h5>Selected Permissions:</h5>
                        <ul>
                            {permissions.map((permissionId) => {
                                const permission = availablePermissions.find(p => p.permissionID === permissionId);
                                return permission ? (
                                    <li key={permission.permissionID}>{permission.name}</li>
                                ) : null;
                            })}
                        </ul>
                    </div>
                )}

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Add User</button>
            </form>

            {/* Permissions Modal */}
            {showPermissionsModal && (
                <div className="modal show" style={{ display: "block" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Permissions</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => setShowPermissionsModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {availablePermissions.map((permission) => (
                                    <div className="form-check" key={permission.permissionID}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`permission-${permission.permissionID}`}
                                            value={permission.permissionID}
                                            onChange={handlePermissionChange}
                                        />
                                        <label className="form-check-label" htmlFor={`permission-${permission.permissionID}`}>
                                            {permission.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowPermissionsModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddUser;
