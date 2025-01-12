import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../../services/authService";
import { getAllDepartments, updateUserDepartmentAndPermissions } from "../../services/departmentService";

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        role: "",
        departmentId: "",
    });
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await getUserById(id);
                setFormData({
                    ...user,
                    departmentId: user.department ? user.department.departmentId : "",
                });
            } catch (err) {
                console.error("Error fetching user details:", err);
                setError("Unable to fetch user details.");
            }
        };

        const fetchDepartments = async () => {
            try {
                const departmentsData = await getAllDepartments();
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
            await updateUser(id, formData);
            setSuccessMessage("User updated successfully!");
            setError("");

            await updateUserDepartmentAndPermissions(id, formData.departmentId);

            setSuccessMessage("User updated and department/permissions synchronized.");
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
        <div className="container ">
            <div className="card shadow-lg p-4">
                <h1 className="text-center">
                    Chỉnh Sửa Người Dùng
                </h1>

                {/* Thông báo thành công */}
                {successMessage && (
                    <div className="alert alert-success text-center">{successMessage}</div>
                )}

                {/* Thông báo lỗi */}
                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Tên Đăng Nhập</label>
                            <input
                                type="text"
                                className="form-control"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Nhập tên đăng nhập"
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Họ và Tên</label>
                            <input
                                type="text"
                                className="form-control"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email"
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Vai Trò</label>
                            <select
                                className="form-select"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Chọn vai trò</option>
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Staff">Staff</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12 mb-3">
                            <label className="form-label fw-bold">Phòng Ban</label>
                            <select
                                className="form-select"
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Chọn phòng ban</option>
                                {departments.map((department) => (
                                    <option
                                        key={department.departmentId}
                                        value={department.departmentId}
                                    >
                                        {department.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <button type="submit" className="btn btn-success btn-lg px-5">
                            Lưu Thay Đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUser;
