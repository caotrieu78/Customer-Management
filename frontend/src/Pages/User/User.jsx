import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getAllUsers, deleteUser } from "../../services/authService";
import { PATHS } from "../../constant/pathnames";

function User() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [columnSearch, setColumnSearch] = useState({
        username: "",
        fullName: "",
        email: "",
        department: "",
    }); // Lưu trạng thái tìm kiếm theo cột
    const [visibleSearch, setVisibleSearch] = useState({
        username: false,
        fullName: false,
        email: false,
        department: false,
    }); // Lưu trạng thái hiển thị của ô tìm kiếm theo cột
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [userToDelete, setUserToDelete] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
                setFilteredUsers(data);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Unable to fetch users.");
            }
        };

        fetchUsers();
    }, []);

    // Apply search and filters
    useEffect(() => {
        let tempUsers = [...users];

        // Exclude "Admin" role
        tempUsers = tempUsers.filter((user) => user.role !== "Admin");

        // Filter by role
        if (roleFilter) {
            tempUsers = tempUsers.filter((user) => user.role === roleFilter);
        }

        // Filter by general search term
        if (searchTerm) {
            tempUsers = tempUsers.filter(
                (user) =>
                    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by column search
        tempUsers = tempUsers.filter(
            (user) =>
                user.username.toLowerCase().includes(columnSearch.username.toLowerCase()) &&
                user.fullName.toLowerCase().includes(columnSearch.fullName.toLowerCase()) &&
                user.email.toLowerCase().includes(columnSearch.email.toLowerCase()) &&
                (user.department?.departmentName || "")
                    .toLowerCase()
                    .includes(columnSearch.department.toLowerCase())
        );

        setFilteredUsers(tempUsers);
        setCurrentPage(1); // Reset to the first page after filtering
    }, [searchTerm, roleFilter, columnSearch, users]);

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

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const toggleSearch = (column) => {
        setVisibleSearch((prev) => ({
            ...prev,
            [column]: !prev[column], // Chuyển đổi trạng thái hiện/ẩn của ô tìm kiếm
        }));
    };

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (users.length === 0) {
        return <div className="alert alert-warning">Không có user nào được tìm thấy.</div>;
    }

    return (
        <div className="container">
            {/* Success Message */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <h1 className="text-center">
                <i className=""></i>QUẢN LÝ KHÁCH HÀNG
            </h1>

            {/* General Search and Filter */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <input
                    type="text"
                    className="form-control w-50 me-3"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-select w-25"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                </select>
                <NavLink to={PATHS.ADD_USER} className="btn btn-primary me-2">
                    <i class="bi bi-plus-square"></i> Thêm User
                </NavLink>
            </div>
            {/* User Table */}
            <div class="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Username
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("username")}
                                    ></i>
                                </div>
                                {visibleSearch.username && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm Username"
                                        value={columnSearch.username}
                                        onChange={(e) =>
                                            setColumnSearch({ ...columnSearch, username: e.target.value })
                                        }
                                    />
                                )}
                            </th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Full Name
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("fullName")}
                                    ></i>
                                </div>
                                {visibleSearch.fullName && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm Full Name"
                                        value={columnSearch.fullName}
                                        onChange={(e) =>
                                            setColumnSearch({ ...columnSearch, fullName: e.target.value })
                                        }
                                    />
                                )}
                            </th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Email
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("email")}
                                    ></i>
                                </div>
                                {visibleSearch.email && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm Email"
                                        value={columnSearch.email}
                                        onChange={(e) =>
                                            setColumnSearch({ ...columnSearch, email: e.target.value })
                                        }
                                    />
                                )}
                            </th>
                            <th>Role</th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Department
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("department")}
                                    ></i>
                                </div>
                                {visibleSearch.department && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm Department"
                                        value={columnSearch.department}
                                        onChange={(e) =>
                                            setColumnSearch({
                                                ...columnSearch,
                                                department: e.target.value,
                                            })
                                        }
                                    />
                                )}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.username}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.department ? user.department.departmentName : "N/A"}</td>
                                <td>
                                    <NavLink
                                        to={`${PATHS.EDIT_USER}/${user.userId}`}
                                        className="btn btn-warning btn-sm me-2"
                                    >
                                        <i class="bi bi-pencil-square"></i> Sửa
                                    </NavLink>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => confirmDelete(user.userId)}
                                    >
                                        <i class="bi bi-trash"></i> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
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
