import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../services/authService";
import { PATHS } from "../../constant/pathnames";
import { getAllDepartments } from "../../services/departmentService";

function AddUser() {
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        role: "",
        password: "",
        departmentId: "",
        avatar: "avatar_admin.png", // Default avatar
    });
    const [departments, setDepartments] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Fetch departments
    useEffect(() => {
        const fetchData = async () => {
            try {
                const departmentsData = await getAllDepartments();
                setDepartments(departmentsData);
            } catch (err) {
                console.error("Failed to fetch departments:", err);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.departmentId) {
            setError("Please select a department.");
            return;
        }

        const userPayload = {
            username: formData.username,
            password: formData.password,
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role,
            avatar: formData.avatar,
            department: {
                departmentId: formData.departmentId,
            },
        };

        try {
            await createUser(userPayload);
            setMessage("User added successfully!");
            setError("");
            setTimeout(() => {
                navigate(PATHS.USER);
            }, 1000);
        } catch (err) {
            console.error("Error adding user:", err);
            setError("Failed to add user. Please try again.");
            setMessage("");
        }
    };

    return (
        <div className="container">
            <div className="card shadow-sm p-4">
                <h1 className="text-center">
                    Thêm Người Dùng
                </h1>
                {message && <div className="alert alert-success text-center">{message}</div>}
                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="username" className="form-label fw-bold">Tên Đăng Nhập</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Nhập tên đăng nhập"
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="fullName" className="form-label fw-bold">Họ và Tên</label>
                            <input
                                type="text"
                                className="form-control"
                                id="fullName"
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
                            <label htmlFor="email" className="form-label fw-bold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email"
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="password" className="form-label fw-bold">Mật Khẩu</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu"
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="role" className="form-label fw-bold">Vai Trò</label>
                            <select
                                className="form-select"
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Chọn Vai Trò</option>
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Staff">Staff</option>
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="departmentId" className="form-label fw-bold">Phòng Ban</label>
                            <select
                                className="form-select"
                                id="departmentId"
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Chọn Phòng Ban</option>
                                {departments.map((department) => (
                                    <option key={department.departmentId} value={department.departmentId}>
                                        {department.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <button type="submit" className="btn btn-primary btn-lg px-5">
                            Thêm Người Dùng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUser;
