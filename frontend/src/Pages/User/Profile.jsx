import React, { useState, useEffect } from "react";
import { updateUser, getUserById } from "../../services/authService";

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const userId = JSON.parse(localStorage.getItem("user"))?.userId;

    useEffect(() => {
        if (!userId) {
            setError("Người dùng không tồn tại. Vui lòng đăng nhập.");
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const userData = await getUserById(userId);
                setUser(userData);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu người dùng:", err);
                setError("Lỗi khi lấy dữ liệu người dùng");
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatarFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewAvatar(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async () => {
        const formData = new FormData();

        if (avatarFile) {
            formData.append("file", avatarFile);
        }
        formData.append("username", user.username);
        formData.append("fullName", user.fullName);
        formData.append("email", user.email);
        formData.append("role", user.role);

        try {
            const updatedUser = await updateUser(userId, formData);
            setUser(updatedUser);
            alert("Cập nhật hồ sơ thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error.response || error);
            alert("Lỗi khi cập nhật hồ sơ.");
        }
    };

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    const handlePreviewModal = () => {
        setShowPreviewModal(true);
        setShowDropdown(false);
    };

    const handleModalClose = () => {
        setShowPreviewModal(false);
    };

    if (loading) return <div className="text-center">Đang tải...</div>;
    if (error) return <div className="text-center">{error}</div>;

    return (
        <div className="container mt-5">
            {user && (
                <div className="row justify-content-center">
                    <div className="col-md-8 text-center">
                        <div className="profile-card shadow-lg p-4 bg-white rounded">
                            {/* Phần Avatar */}
                            <div
                                className="avatar-section mb-4 position-relative"
                                style={{ display: "inline-block" }}
                            >
                                <div
                                    className="avatar-border"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                                        borderRadius: "50%",
                                        padding: "5px",
                                        display: "inline-block"
                                    }}
                                >
                                    <img
                                        src={previewAvatar || user.avatar || "/default-avatar.png"}
                                        alt="User Avatar"
                                        className="rounded-circle shadow"
                                        height="200"
                                        width="200"
                                        style={{
                                            objectFit: "cover",
                                            border: "3px solid white",
                                            cursor: "pointer",
                                            transition: "transform 0.3s ease-in-out"
                                        }}
                                        onClick={toggleDropdown}
                                        onMouseOver={(e) =>
                                            (e.target.style.transform = "scale(1.1)")
                                        }
                                        onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                                    />
                                </div>
                                {showDropdown && (
                                    <div
                                        className="dropdown-menu show"
                                        style={{
                                            position: "absolute",
                                            top: "220px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            zIndex: "1000",
                                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                            background: "#fff",
                                            borderRadius: "10px",
                                            padding: "10px"
                                        }}
                                    >
                                        <button
                                            className="dropdown-item"
                                            onClick={handlePreviewModal}
                                            style={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                padding: "8px"
                                            }}
                                        >
                                            <i className="bi bi-eye"></i> Xem ảnh đại diện
                                        </button>
                                        <label
                                            className="dropdown-item"
                                            htmlFor="avatarFile"
                                            style={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                padding: "8px"
                                            }}
                                        >
                                            <i className="bi bi-upload"></i> Chọn ảnh đại diện
                                            <input
                                                type="file"
                                                id="avatarFile"
                                                className="d-none"
                                                onChange={handleAvatarChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                )}
                                <h3 className="text-primary mt-3">{user.username}</h3>
                            </div>

                            {/* Phần Vai trò Người dùng */}
                            <p className="fs-5 text-secondary mb-4">
                                Chào mừng bạn đến với hệ thống quản lý khách hàng với vai trò{" "}
                                <strong className="text-success">{user.role}</strong>.
                            </p>

                            {/* Thông tin người dùng */}
                            <div className="user-details mb-4 text-start ">
                                <div className="form-group mb-3">
                                    <label htmlFor="username" className="form-label ms-2">
                                        <i className="bi bi-person "></i> Tên người dùng:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={user.username}
                                        onChange={(e) =>
                                            setUser({ ...user, username: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="fullName" className="form-label ms-2">
                                        <i className="bi bi-person-circle"></i> Họ và tên:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="fullName"
                                        value={user.fullName}
                                        onChange={(e) =>
                                            setUser({ ...user, fullName: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="email" className="form-label ms-2">
                                        <i className="bi bi-envelope"></i> Email:
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={user.email}
                                        onChange={(e) =>
                                            setUser({ ...user, email: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Nút Cập nhật thông tin */}
                            <button
                                className="btn btn-primary w-100"
                                onClick={handleUpdateProfile}
                            >
                                Cập nhật thông tin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xem ảnh đại diện */}
            {showPreviewModal && (
                <div
                    className="modal show"
                    style={{ display: "block", position: "fixed", zIndex: "1050" }}
                    onClick={handleModalClose}
                >
                    <div
                        className="modal-dialog modal-lg"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: "80%",
                            margin: "auto"
                        }}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Xem ảnh đại diện</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleModalClose}
                                />
                            </div>
                            <div className="modal-body">
                                <img
                                    src={previewAvatar || user.avatar || "/default-avatar.png"}
                                    alt="User Avatar"
                                    className="w-100"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "calc(100vh - 200px)", // Đảm bảo không vượt chiều cao màn hình
                                        objectFit: "contain", // Giữ tỷ lệ
                                        display: "block",
                                        margin: "0 auto"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
