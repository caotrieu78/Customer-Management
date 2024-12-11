import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, getAllPermissions, getPermissionsByUserId, assignPermissionToUser, removePermissionFromUser, updateUser } from "../../services/authService";

function EditUser() {
    const { id } = useParams(); // Get user ID from URL
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        role: "",
    });
    const [userPermissions, setUserPermissions] = useState([]); // Permissions user already has
    const [allPermissions, setAllPermissions] = useState([]); // All available permissions
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); // State for success message

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await getUserById(id); // Fetch user data by ID
                setFormData(user);
                const permissions = await getPermissionsByUserId(id); // Fetch user's current permissions
                setUserPermissions(permissions.map((perm) => perm.permissionID)); // Store PermissionIDs
            } catch (err) {
                console.error("Error fetching user or permissions:", err);
                setError("Unable to fetch user details.");
            }
        };

        const fetchAllPermissions = async () => {
            try {
                const allPermissions = await getAllPermissions(); // Fetch all permissions
                setAllPermissions(allPermissions);
            } catch (err) {
                console.error("Failed to fetch permissions:", err);
            }
        };

        fetchUserData();
        fetchAllPermissions();
    }, [id]);

    const handleAddPermission = async (permissionId) => {
        try {
            await assignPermissionToUser(id, [permissionId]); // Assign permission to user
            setUserPermissions([...userPermissions, permissionId]); // Update local state
            setSuccessMessage("Permission added successfully.");
        } catch (err) {
            console.error("Error adding permission:", err);
            setError("Unable to add permission.");
        }
    };

    const handleRemovePermission = async (permissionId) => {
        try {
            await removePermissionFromUser(id, permissionId); // Remove permission from user
            setUserPermissions(userPermissions.filter((permId) => permId !== permissionId)); // Update local state
            setSuccessMessage("Permission removed successfully.");
        } catch (err) {
            console.error("Error removing permission:", err);
            setError("Unable to remove permission.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser(id, formData); // Update user details
            setSuccessMessage("User updated successfully!");
            setError("");

            // Clear the success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
                navigate("/user");
            }, 2000);
        } catch (err) {
            console.error("Error updating user details:", err);
            setError("Unable to update user details.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit User</h1>

            {/* Display success message */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            {/* Display error message */}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                    </select>
                </div>

                {/* Permissions Section */}
                <div className="mb-3">
                    <h4>Manage Permissions</h4>
                    {allPermissions.map((permission) => (
                        <div className="d-flex align-items-center mb-2" key={permission.permissionID}>
                            <span className="me-2">{permission.name}</span>
                            {userPermissions.includes(permission.permissionID) ? (
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemovePermission(permission.permissionID)}
                                >
                                    Remove
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleAddPermission(permission.permissionID)}
                                >
                                    Add
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button type="submit" className="btn btn-success">Update User</button>
            </form>
        </div>
    );
}

export default EditUser;
