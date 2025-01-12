import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { PATHS } from "../../constant/pathnames";
import { getPermissionsByUserId, getAllPermissions } from "../../services/authService";

function Slidebar({ isCollapsed }) {
    const [dynamicMenuItems, setDynamicMenuItems] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                let permissions = [];

                if (user && user.role === "Admin") {
                    // Admins get all permissions
                    permissions = await getAllPermissions();
                } else if (user && user.userId) {
                    // Other users fetch permissions by userId
                    permissions = await getPermissionsByUserId(user.userId);
                }

                const mappedMenuItems = mapPermissionsToMenuItems(permissions);
                setDynamicMenuItems(mappedMenuItems); // Update menu items dynamically
            } catch (error) {
                console.error("Failed to fetch permissions:", error);
            }
        };

        fetchPermissions();
    }, [user]); // Rerun when the user changes or updates occur

    const mapPermissionsToMenuItems = (permissions) =>
        permissions.map((permission) => ({
            path: getPathFromName(permission.name.trim()), // Ensure names are trimmed
            icon: permission.icon || "bi-circle", // Default icon if not provided
            label: permission.name,
        }));

    const getPathFromName = (name) => {
        const pathsMap = {
            "Quản lý người dùng": PATHS.USER,
            "Quản lý phòng ban": PATHS.DEPARTMENTS,
            "Quản lý khách hàng": PATHS.CUSTOMER,
            "Quản lý dự án": PATHS.PROJECT,
            "Quản lý sự kiện": PATHS.EVENT,
            "Thông Báo nhắc nhở": PATHS.REMAIND,
            "Quản lý thanh toán": PATHS.PAYMENT,
            "Thống kê và báo cáo": PATHS.THONGKE,
        };
        return pathsMap[name] || PATHS.HOME;
    };

    return (
        <nav className={`bg-dark text-white p-3 d-flex flex-column ${isCollapsed ? "collapsed-sidebar" : ""}`}>
            <h5 className={`text-white mb-4 ${isCollapsed ? "d-none" : ""}`}>Trang Admin</h5>
            <ul className="nav flex-column">
                {dynamicMenuItems.map((item, index) => (
                    <li className="nav-item mb-2" key={index}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link text-white ${isActive ? "active" : ""}`
                            }
                        >
                            <i className={`bi ${item.icon} me-2`}></i>
                            {!isCollapsed && item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Slidebar;
