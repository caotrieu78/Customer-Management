import React, { useState, useEffect } from "react";
import {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getPermissionsByDepartmentId,
    assignPermissionsToDepartment,
    removePermissionFromDepartment,
    getUsersByDepartmentId,  // API để lấy người dùng của phòng ban
} from "../../services/departmentService";
import { getAllPermissions } from "../../services/authService";
import { updateDepartmentPermissions } from "../../services/departmentService";

function DepartmentList() {
    const [departments, setDepartments] = useState([]);
    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [allPermissions, setAllPermissions] = useState([]); // Tất cả quyền
    const [departmentPermissions, setDepartmentPermissions] = useState([]); // Quyền hiện có của phòng ban
    const [targetDepartment, setTargetDepartment] = useState(null); // Phòng ban đang thao tác
    const [usersInDepartment, setUsersInDepartment] = useState([]); // Danh sách người dùng
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false); // Để quản lý trạng thái loading

    // Lấy dữ liệu phòng ban và quyền khi tải trang
    useEffect(() => {
        fetchDepartments();
        fetchAllPermissions();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getAllDepartments();
            setDepartments(data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách phòng ban:", err);
            setError("Không thể lấy danh sách phòng ban.");
        }
    };

    const fetchAllPermissions = async () => {
        try {
            const data = await getAllPermissions();
            setAllPermissions(data);
        } catch (err) {
            console.error("Lỗi khi lấy quyền:", err);
            setError("Không thể lấy danh sách quyền.");
        }
    };

    const fetchUsersInDepartment = async (departmentId) => {
        try {
            const usersData = await getUsersByDepartmentId(departmentId);
            setUsersInDepartment(usersData);
        } catch (err) {
            console.error("Lỗi khi lấy người dùng:", err);
            setError("Không thể lấy danh sách người dùng.");
        }
    };

    const handleCreateDepartment = async () => {
        if (!newDepartmentName) {
            setError("Tên phòng ban không được để trống.");
            return;
        }
        try {
            await createDepartment({ departmentName: newDepartmentName });
            setSuccessMessage("Tạo phòng ban thành công.");
            setError("");
            setNewDepartmentName("");
            fetchDepartments();
        } catch (err) {
            console.error("Lỗi khi tạo phòng ban:", err);
            setError("Không thể tạo phòng ban.");
            setSuccessMessage("");
        }
    };

    const handleUpdateDepartment = async () => {
        if (!editingDepartment.departmentName) {
            setError("Tên phòng ban không được để trống.");
            return;
        }
        try {
            await updateDepartment(editingDepartment.departmentId, {
                departmentName: editingDepartment.departmentName,
            });
            setSuccessMessage("Cập nhật phòng ban thành công.");
            setError("");
            setEditingDepartment(null);
            fetchDepartments();
        } catch (err) {
            console.error("Lỗi khi cập nhật phòng ban:", err);
            setError("Không thể cập nhật phòng ban.");
            setSuccessMessage("");
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) return;

        try {
            await deleteDepartment(id);
            setSuccessMessage("Xóa phòng ban thành công.");
            setError("");
            fetchDepartments();
        } catch (err) {
            console.error("Lỗi khi xóa phòng ban:", err);
            setError("Không thể xóa phòng ban.");
            setSuccessMessage("");
        }
    };

    const openPermissionsModal = async (departmentId) => {
        setTargetDepartment(departmentId);
        setError(""); // Đặt lại lỗi cũ
        setSuccessMessage(""); // Đặt lại thông báo thành công cũ

        try {
            const permissionsData = await getPermissionsByDepartmentId(departmentId);

            // Nếu không có quyền nào được gán, đặt departmentPermissions là mảng trống
            setDepartmentPermissions(permissionsData.map((perm) => perm.permissionID));

            // Lấy người dùng của phòng ban khi mở modal
            fetchUsersInDepartment(departmentId);
        } catch (err) {
            console.error("Lỗi khi lấy quyền phòng ban:", err);
            setError("Không thể lấy quyền của phòng ban này. Vui lòng thử lại sau.");
            setDepartmentPermissions([]); // Đảm bảo không lỗi nếu API trả về lỗi
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

    const handleRemovePermission = async (permissionId) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Sử dụng targetDepartment (departmentId) và permissionId để xóa quyền
            await removePermissionFromDepartment(targetDepartment, permissionId);

            // Cập nhật lại danh sách quyền sau khi xóa quyền
            setDepartmentPermissions((prevPermissions) =>
                prevPermissions.filter((id) => id !== permissionId)
            );

            setSuccessMessage("Xóa quyền thành công.");
        } catch (error) {
            setError("Không thể xóa quyền.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Quản lý Phòng ban</h1>

            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-4">
                <h4>Tạo phòng ban mới</h4>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên phòng ban"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleCreateDepartment}>
                        Thêm
                    </button>
                </div>
            </div>

            <h4>Danh sách phòng ban</h4>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên phòng ban</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((department, index) => (
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
                                    <>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={handleUpdateDepartment}
                                        >
                                            Lưu
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm ms-2"
                                            onClick={() => setEditingDepartment(null)}
                                        >
                                            Hủy
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => setEditingDepartment(department)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm ms-2"
                                            onClick={() => handleDeleteDepartment(department.departmentId)}
                                        >
                                            Xóa
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm ms-2"
                                            onClick={() => openPermissionsModal(department.departmentId)}
                                        >
                                            Quản lý quyền
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal quản lý quyền */}
            {targetDepartment && (
                <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" aria-labelledby="permissionsModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="permissionsModalLabel">Quản lý quyền</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setTargetDepartment(null)}></button>
                            </div>
                            <div className="modal-body">
                                {/* Danh sách quyền */}
                                {allPermissions.length === 0 ? (
                                    <p className="text-center">Không có quyền nào.</p>
                                ) : (
                                    allPermissions.map((permission) => (
                                        <div className="d-flex justify-content-between align-items-center mb-3" key={permission.permissionID}>
                                            <span>{permission.name}</span>
                                            {departmentPermissions.includes(permission.permissionID) ? (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRemovePermission(permission.permissionID)}
                                                >
                                                    Xóa
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleAddPermission(permission.permissionID)}
                                                >
                                                    Thêm
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}

                                {/* Danh sách người dùng */}
                                <div className="mt-4">
                                    <h6>Người dùng trong phòng ban này:</h6>
                                    {usersInDepartment.length === 0 ? (
                                        <p>Không có người dùng trong phòng ban này.</p>
                                    ) : (
                                        <table className="table table-bordered">
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
                                <button className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setTargetDepartment(null)}>
                                    Đóng
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
