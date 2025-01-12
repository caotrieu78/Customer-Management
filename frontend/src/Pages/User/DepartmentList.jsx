import React, { useState, useEffect } from "react";
import {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getPermissionsByDepartmentId,
    assignPermissionsToDepartment,
    removePermissionFromDepartment,
    getUsersByDepartmentId,
    updateDepartmentPermissions,
} from "../../services/departmentService";
import { getAllPermissions } from "../../services/authService";

function DepartmentList() {
    const [departments, setDepartments] = useState([]); // Danh sách phòng ban
    const [filteredDepartments, setFilteredDepartments] = useState([]); // Danh sách phòng ban sau khi lọc
    const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
    const [newDepartmentName, setNewDepartmentName] = useState(""); // Tên phòng ban mới
    const [editingDepartment, setEditingDepartment] = useState(null); // Phòng ban đang sửa
    const [allPermissions, setAllPermissions] = useState([]); // Tất cả quyền
    const [departmentPermissions, setDepartmentPermissions] = useState([]); // Quyền của phòng ban
    const [targetDepartment, setTargetDepartment] = useState(null); // Phòng ban đang thao tác
    const [usersInDepartment, setUsersInDepartment] = useState([]); // Người dùng trong phòng ban
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Lấy danh sách phòng ban và quyền khi component được render
    useEffect(() => {
        fetchDepartments();
        fetchAllPermissions();
    }, []);

    // Lọc danh sách phòng ban theo từ khóa tìm kiếm
    useEffect(() => {
        const filtered = departments.filter((department) =>
            department.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDepartments(filtered);
    }, [searchTerm, departments]);
    // Tự động ẩn thông báo sau 3 giây
    useEffect(() => {
        if (successMessage || error) {
            const timeout = setTimeout(() => {
                setSuccessMessage("");
                setError("");
            }, 3000); // 3 giây

            return () => clearTimeout(timeout); // Dọn dẹp timeout khi unmount hoặc khi có thông báo mới
        }
    }, [successMessage, error]);
    // Lấy danh sách phòng ban từ API
    const fetchDepartments = async () => {
        try {
            const data = await getAllDepartments();
            setDepartments(data);
            setFilteredDepartments(data); // Hiển thị danh sách ban đầu
        } catch (err) {
            console.error("Lỗi khi lấy danh sách phòng ban:", err);
            setError("Không thể lấy danh sách phòng ban.");
        }
    };

    // Lấy danh sách tất cả quyền
    const fetchAllPermissions = async () => {
        try {
            const data = await getAllPermissions();
            setAllPermissions(data);
        } catch (err) {
            console.error("Lỗi khi lấy quyền:", err);
            setError("Không thể lấy danh sách quyền.");
        }
    };

    // Lấy danh sách người dùng trong phòng ban
    const fetchUsersInDepartment = async (departmentId) => {
        try {
            const usersData = await getUsersByDepartmentId(departmentId);
            setUsersInDepartment(usersData);
        } catch (err) {
            console.error("Lỗi khi lấy người dùng:", err);
            setError("Không thể lấy danh sách người dùng.");
        }
    };

    // Thêm phòng ban mới
    const handleCreateDepartment = async () => {
        if (!newDepartmentName.trim()) {
            setError("Tên phòng ban không được để trống.");
            return;
        }
        try {
            await createDepartment({ departmentName: newDepartmentName });
            setSuccessMessage("Tạo phòng ban thành công.");
            setError("");
            setNewDepartmentName(""); // Reset input sau khi thêm
            fetchDepartments(); // Lấy lại danh sách phòng ban
        } catch (err) {
            console.error("Lỗi khi tạo phòng ban:", err);
            setError("Không thể tạo phòng ban.");
            setSuccessMessage("");
        }
    };

    // Cập nhật phòng ban
    const handleUpdateDepartment = async () => {
        if (!editingDepartment.departmentName.trim()) {
            setError("Tên phòng ban không được để trống.");
            return;
        }
        try {
            await updateDepartment(editingDepartment.departmentId, {
                departmentName: editingDepartment.departmentName,
            });
            setSuccessMessage("Cập nhật phòng ban thành công.");
            setError("");
            setEditingDepartment(null); // Đóng chế độ sửa
            fetchDepartments(); // Lấy lại danh sách phòng ban
        } catch (err) {
            console.error("Lỗi khi cập nhật phòng ban:", err);
            setError("Không thể cập nhật phòng ban.");
            setSuccessMessage("");
        }
    };

    // Xóa phòng ban
    const handleDeleteDepartment = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) return;

        try {
            await deleteDepartment(id);
            setSuccessMessage("Xóa phòng ban thành công.");
            setError("");
            fetchDepartments(); // Lấy lại danh sách phòng ban
        } catch (err) {
            console.error("Lỗi khi xóa phòng ban:", err);
            setError("Không thể xóa phòng ban.");
        }
    };

    // Mở modal quản lý quyền
    const openPermissionsModal = async (departmentId) => {
        setTargetDepartment(departmentId);
        setError("");
        setSuccessMessage("");

        try {
            const permissionsData = await getPermissionsByDepartmentId(departmentId);
            setDepartmentPermissions(permissionsData.map((perm) => perm.permissionID));
            fetchUsersInDepartment(departmentId); // Lấy người dùng trong phòng ban
        } catch (err) {
            console.error("Lỗi khi lấy quyền:", err);
            setError("Không thể lấy quyền của phòng ban này.");
            setDepartmentPermissions([]);
        }
    };

    const handleAddPermission = async (permissionId) => {
        try {
            await assignPermissionsToDepartment(targetDepartment, [permissionId]); // Gán quyền mới
            setDepartmentPermissions([...departmentPermissions, permissionId]); // Cập nhật trạng thái local

            // Gọi API đồng bộ quyền của phòng ban và người dùng
            await updateDepartmentPermissions(targetDepartment, [...departmentPermissions, permissionId]);

            setSuccessMessage("Thêm quyền và đồng bộ thành công.");
        } catch (err) {
            console.error("Lỗi khi thêm quyền:", err);
            setError("Không thể thêm quyền.");
        }
    };

    // Xóa quyền
    const handleRemovePermission = async (permissionId) => {
        try {
            await removePermissionFromDepartment(targetDepartment, permissionId);
            setDepartmentPermissions((prev) => prev.filter((id) => id !== permissionId));
            setSuccessMessage("Xóa quyền thành công.");
        } catch (err) {
            console.error("Lỗi khi xóa quyền:", err);
            setError("Không thể xóa quyền.");
        }
    };

    return (
        <div className="container">
            <h1 className="text-center mb-4">Quản lý Phòng Ban</h1>

            {/* Thông báo */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {error && <div className="alert alert-danger">{error}</div>}



            {/* Hàng chứa Thêm phòng ban và Tìm kiếm */}
            <div className="row mb-4">
                {/* Cột Tìm kiếm phòng ban */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">Tìm Kiếm Phòng Ban <i class="bi bi-search"></i></h5>
                        </div>
                        <div className="card-body">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm phòng ban..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                {/* Cột Thêm phòng ban */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Thêm Phòng Ban  <i class="bi bi-plus-square"></i></h5>
                        </div>
                        <div className="card-body">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className={`form-control ${error ? "is-invalid" : ""}`}
                                    placeholder="Nhập tên phòng ban mới"
                                    value={newDepartmentName}
                                    onChange={(e) => {
                                        setNewDepartmentName(e.target.value);
                                        setError(""); // Xóa lỗi khi người dùng nhập lại
                                    }}
                                />
                                <button className="btn btn-primary" onClick={handleCreateDepartment}>
                                    Thêm
                                </button>
                            </div>
                            {/* Hiển thị lỗi nếu có */}
                            {error && <div className="invalid-feedback d-block mt-2">{error}</div>}
                        </div>
                    </div>
                </div>


            </div>

            {/* Danh sách phòng ban */}
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên phòng ban</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDepartments.map((department, index) => (
                        <tr key={department.departmentId}>
                            <td>{index + 1}</td>
                            <td>
                                {editingDepartment?.departmentId === department.departmentId ? (
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingDepartment.departmentName}
                                        onChange={(e) =>
                                            setEditingDepartment({
                                                ...editingDepartment,
                                                departmentName: e.target.value,
                                            })
                                        }
                                    />
                                ) : (
                                    department.departmentName
                                )}
                            </td>
                            <td>
                                {editingDepartment?.departmentId === department.departmentId ? (
                                    <div className="d-flex flex-nowrap gap-2">
                                        {/* Lưu */}
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={handleUpdateDepartment}
                                        >
                                            <i class="bi bi-floppy2-fill"></i> Lưu
                                        </button>
                                        {/* Hủy */}
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setEditingDepartment(null)}
                                        >
                                            <i class="bi bi-x-square"></i> Hủy
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-nowrap gap-2">
                                        {/* Sửa */}
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => setEditingDepartment(department)}
                                        >
                                            <i class="bi bi-pencil-square"></i> Sửa
                                        </button>
                                        {/* Xóa */}
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteDepartment(department.departmentId)}
                                        >
                                            <i class="bi bi-trash "></i> Xóa
                                        </button>
                                        {/* Quản lý quyền */}
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => openPermissionsModal(department.departmentId)}
                                        >
                                            <i class="bi bi-credit-card-2-front"></i> Quản lý quyền
                                        </button>
                                    </div>
                                )}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal quản lý quyền */}
            {targetDepartment && (
                <div className="modal fade show" style={{ display: "block" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Quản lý quyền Của Phòng
                                    {targetDepartment && (
                                        <span className="text-primary ms-2">
                                            {departments.find(dep => dep.departmentId === targetDepartment)?.departmentName || "Chưa xác định"}
                                        </span>
                                    )}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setTargetDepartment(null)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                {allPermissions.length === 0 ? (
                                    <p className="text-center">Không có quyền nào.</p>
                                ) : (
                                    allPermissions.map((permission) => (
                                        <div
                                            className="d-flex justify-content-between align-items-center mb-3"
                                            key={permission.permissionID}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <i className={permission.icon}></i>
                                                <span>{permission.name}</span>
                                            </div>
                                            {departmentPermissions.includes(permission.permissionID) ? (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        handleRemovePermission(permission.permissionID)
                                                    }
                                                >
                                                    <i class="bi bi-trash "></i> Xóa
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() =>
                                                        handleAddPermission(permission.permissionID)
                                                    }
                                                >
                                                    <i class="bi bi-plus-square"></i> Thêm
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}

                                {/* Danh sách người dùng */}
                                <div className="mt-4">
                                    <h6>Người dùng trong phòng ban:</h6>
                                    {usersInDepartment.length === 0 ? (
                                        <p>Không có người dùng trong phòng ban.</p>
                                    ) : (
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Username</th>
                                                    <th>Họ và Tên</th>
                                                    <th>Vai trò</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {usersInDepartment.map((user) => (
                                                    <tr key={user.userId}>
                                                        <td>{user.username}</td>
                                                        <td>{user.fullName}</td>
                                                        <td>{user.role}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setTargetDepartment(null)}
                                >
                                    <i class="bi bi-x-square-fill"></i> Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DepartmentList;
