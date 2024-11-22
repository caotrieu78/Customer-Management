import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getAllUsers, deleteUser } from "../../services/authService";
import { PATHS } from "../../constant/pathnames";

function User() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); // Users to display after filtering
    const [searchTerm, setSearchTerm] = useState(""); // Search term state
    const [roleFilter, setRoleFilter] = useState(""); // Role filter state
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [userToDelete, setUserToDelete] = useState(null);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
                setFilteredUsers(data); // Initialize filteredUsers
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Unable to fetch users.");
            }
        };

        fetchUsers();
    }, []);

    // Apply search and role filter
    useEffect(() => {
        let tempUsers = [...users];

        // Loại bỏ vai trò "Admin"
        tempUsers = tempUsers.filter((user) => user.role !== "Admin");

        // Lọc theo vai trò nếu roleFilter được chọn
        if (roleFilter) {
            tempUsers = tempUsers.filter((user) => user.role === roleFilter);
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            tempUsers = tempUsers.filter(
                (user) =>
                    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(tempUsers);
    }, [searchTerm, roleFilter, users]);


    // Handle delete user
    const confirmDelete = (userId) => {
        setUserToDelete(userId);
    };

    const handleDelete = async () => {
        try {
            await deleteUser(userToDelete);
            setUsers(users.filter((user) => user.userId !== userToDelete));
            setSuccessMessage("User deleted successfully!");
            setUserToDelete(null);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Unable to delete user.");
        }
    };

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (users.length === 0) {
        return <div className="alert alert-warning">Không có user nào được tìm thấy.</div>;
    }

    return (
        <div className="container mt-4">
            {/* Success Message */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            {/* Add User Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Danh sách User</h1>
                <NavLink to={PATHS.ADD_USER} className="btn btn-primary">
                    Thêm User
                </NavLink>
            </div>

            {/* Search and Filter */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                {/* Search */}
                <input
                    type="text"
                    className="form-control w-50 me-3"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Filter */}
                <select
                    className="form-select w-25"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                </select>
            </div>

            {/* User Table */}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.username}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <NavLink
                                        to={`${PATHS.EDIT_USER}/${user.userId}`} // Navigate to Edit page
                                        className="btn btn-warning btn-sm me-2"
                                    >
                                        Sửa
                                    </NavLink>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => confirmDelete(user.userId)} // Confirm delete
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {userToDelete && (
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
                                    onClick={() => setUserToDelete(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Bạn có chắc chắn muốn xóa user này?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setUserToDelete(null)}
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

export default User;
