import React, { useState, useEffect } from "react";
import { updateUser, getUserById } from "../../services/authService";

function Profile() {
    const [user, setUser] = useState(null); // Store the user data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [avatarFile, setAvatarFile] = useState(null); // Store avatar file for upload
    const [previewAvatar, setPreviewAvatar] = useState(""); // Preview avatar before upload

    const userId = JSON.parse(localStorage.getItem("user"))?.userId;

    useEffect(() => {
        // If no userId, show an error message
        if (!userId) {
            setError("User not found. Please log in.");
            setLoading(false);
            return;
        }

        // Fetch user data from the backend using getUserById
        const fetchUserData = async () => {
            try {
                const userData = await getUserById(userId); // Use the imported function
                setUser(userData); // Set user data
                setLoading(false); // Stop loading
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Error fetching user data");
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    // Handle avatar file change and preview
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatarFile(file);

        // Show preview of the new avatar
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewAvatar(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    // Handle profile update
    const handleUpdateProfile = async () => {
        const formData = new FormData();

        if (avatarFile) {
            formData.append("file", avatarFile); // Chỉ gửi file nếu người dùng chọn ảnh mới
        }
        formData.append("username", user.username);
        formData.append("fullName", user.fullName);
        formData.append("email", user.email);
        formData.append("role", user.role);

        try {
            const updatedUser = await updateUser(userId, formData); // Gọi API
            setUser(updatedUser); // Cập nhật thông tin user
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error.response || error);
            alert("Error updating profile.");
        }
    };


    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center">{error}</div>;

    return (
        <div className="container mt-5">
            {user && (
                <div className="row justify-content-center">
                    <div className="col-md-8 text-center">
                        <div className="profile-card shadow-lg p-4 bg-white rounded">
                            {/* Avatar Section */}
                            <div className="avatar-section mb-4">
                                <img
                                    src={previewAvatar || user.avatar || "/default-avatar.png"} // Show default if no avatar set
                                    alt="User Avatar"
                                    className="rounded-circle border border-3 border-primary"
                                    height="200"
                                    width="210"
                                />
                                <h1 className="display-4 text-primary mt-3">{user.username}</h1>
                            </div>

                            {/* User Role */}
                            <p className="fs-4 text-secondary mb-4">
                                Chào mừng bạn đến với hệ thống quản lý khách hàng với vai trò là:{" "}
                                <strong className="text-success">{user.role}</strong>
                            </p>

                            {/* Avatar Upload */}
                            <div className="avatar-upload mb-4">
                                <label htmlFor="avatarFile" className="form-label">Change Avatar:</label>
                                <input
                                    type="file"
                                    id="avatarFile"
                                    className="form-control"
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                />
                            </div>

                            {/* User Details */}
                            <div className="user-details mb-4">
                                <div className="form-group mb-3">
                                    <label htmlFor="username" className="form-label">Username:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={user.username}
                                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="fullName" className="form-label">Full Name:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="fullName"
                                        value={user.fullName}
                                        onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="email" className="form-label">Email:</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={user.email}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Update Button */}
                            <button onClick={handleUpdateProfile} className="btn btn-primary">
                                Update Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
