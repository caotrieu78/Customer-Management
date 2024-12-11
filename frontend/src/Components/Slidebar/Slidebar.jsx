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
                    if (!localStorage.getItem("allPermissions")) {
                        permissions = await getAllPermissions();
                        localStorage.setItem("allPermissions", JSON.stringify(permissions));
                    } else {
                        permissions = JSON.parse(localStorage.getItem("allPermissions"));
                    }
                } else if (user && user.userId) {
                    if (!localStorage.getItem(`permissions_${user.userId}`)) {
                        permissions = await getPermissionsByUserId(user.userId);
                        localStorage.setItem(`permissions_${user.userId}`, JSON.stringify(permissions));
                    } else {
                        permissions = JSON.parse(localStorage.getItem(`permissions_${user.userId}`));
                    }
                }
                const mappedMenuItems = mapPermissionsToMenuItems(permissions);

                // Loại bỏ logic thêm mục Profile vào danh sách menu
                setDynamicMenuItems(mappedMenuItems);
            } catch (error) {
                console.error("Failed to fetch permissions:", error);
            }
        };
        fetchPermissions();
    }, [user]);




    const mapPermissionsToMenuItems = (permissions) =>
        permissions.map((permission) => ({
            path: getPathFromName(permission.name.trim()), // Ensure names are trimmed
            icon: permission.icon,
            label: permission.name,
        }));

    const getPathFromName = (name) => {
        const pathsMap = {
            "Quản lý người dùng": PATHS.USER,
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
