import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../../services/authService";
import { getAllDepartments, updateUserDepartmentAndPermissions } from "../../services/departmentService";
// import { updateUserDepartmentAndPermissions } from "../../services/userService"; // Import API service

function EditUser() {
    const { id } = useParams(); // Get user ID from URL
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        role: "",
        departmentId: "", // Mới thêm trường departmentId
    });
    const [departments, setDepartments] = useState([]); // Danh sách các phòng ban
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); // State for success message

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await getUserById(id); // Fetch user data by ID
                setFormData({
                    ...user,
                    departmentId: user.department ? user.department.departmentId : "", // Set the department if it exists
                });
            } catch (err) {
                console.error("Error fetching user details:", err);
                setError("Unable to fetch user details.");
            }
        };

        const fetchDepartments = async () => {
            try {
                const departmentsData = await getAllDepartments(); // Fetch all departments
                setDepartments(departmentsData);
            } catch (err) {
                console.error("Failed to fetch departments:", err);
                setError("Failed to load departments.");
            }
        };

        fetchUserData();
        fetchDepartments();
    }, [id]);

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

            // Cập nhật phòng ban và quyền cho người dùng
            await updateUserDepartmentAndPermissions(id, formData.departmentId); // Gọi API để cập nhật phòng ban và quyền

            setSuccessMessage("User updated and department/permissions synchronized.");
            setError("");

            // Clear the success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
                navigate("/user"); // Navigate to users page after success
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

                {/* Dropdown phòng ban */}
                <div className="mb-3">
                    <label className="form-label">Department</label>
                    <select
                        className="form-select"
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map((department) => (
                            <option key={department.departmentId} value={department.departmentId}>
                                {department.departmentName}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-success">Update User</button>
            </form>
        </div>
    );
}

export default EditUser;
