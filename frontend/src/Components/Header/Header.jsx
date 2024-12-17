import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById } from "../../services/authService";  // Import getUserById function
import { PATHS } from "../../constant/pathnames";

function Header({ toggleSidebar }) {
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState("");  // State to store avatar URL
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Manage dropdown state
    const navigate = useNavigate(); // Navigation hook

    // Get data from localStorage when the component is rendered
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.userId) {
            setUsername(user.username); // Set username
            fetchUserData(user.userId);  // Fetch user data from API to get the avatar
        }
    }, []);

    // Fetch user data (including avatar) from the backend
    const fetchUserData = async (userId) => {
        try {
            const userData = await getUserById(userId);  // Get user by ID
            if (userData) {
                setAvatar(userData.avatar || "https://via.placeholder.com/40");  // Set avatar URL, fallback to placeholder
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem("user"); // Remove user data from localStorage
        setUsername(""); // Reset username
        setAvatar(""); // Reset avatar
        navigate("/login"); // Navigate to login page
    };

    // Handle View Profile
    const handleViewProfile = () => {
        navigate(PATHS.PROFILE); // Navigate to profile page
    };

    return (
        <header className="bg-white shadow-sm p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    {/* Sidebar Toggle Button */}
                    <button className="btn btn-outline-primary me-3" onClick={toggleSidebar}>
                        <i className="bi bi-list"></i>
                    </button>
                    <h5 className="text-primary m-0">Dashboard</h5>
                </div>
                <div className="d-flex align-items-center">
                    {/* Notification Icon */}
                    {/* <div className="me-3 position-relative">
                        <i className="bi bi-bell-fill text-primary fs-4"></i>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            3
                        </span>
                    </div> */}
                    {/* User Dropdown */}
                    <div className="dropdown">
                        <div
                            className="d-flex align-items-center cursor-pointer"
                            onClick={() => setIsDropdownOpen((prev) => !prev)} // Toggle dropdown
                        >
                            {/* Avatar */}
                            <img
                                src={avatar}  // Use the dynamically fetched avatar
                                alt="Profile"
                                className="rounded-circle me-2 border-primary"
                                height="35" width="35"  // Size of the avatar
                            />
                            <span className="text-dark fw-bold">{username || "Guest"}</span>
                            <i className="bi bi-caret-down-fill ms-2"></i>
                        </div>
                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div
                                className="dropdown-menu dropdown-menu-end show mt-2 shadow"
                                style={{ position: "absolute", right: "0", zIndex: "1050" }}
                            >
                                <button
                                    className="dropdown-item"
                                    onClick={handleViewProfile}
                                >
                                    View Profile
                                </button>
                                <button
                                    className="dropdown-item text-danger fw-bold"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
