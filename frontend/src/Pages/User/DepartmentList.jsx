import React, { useState, useEffect } from "react";
import {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getPermissionsByDepartmentId,
    assignPermissionsToDepartment,
    removePermissionFromDepartment,
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
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false); // Để quản lý trạng thái loading

    // Fetch departments and permissions on mount
    useEffect(() => {
        fetchDepartments();
        fetchAllPermissions();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getAllDepartments();
            setDepartments(data);
        } catch (err) {
            console.error("Error fetching departments:", err);
            setError("Failed to fetch departments.");
        }
    };

    const fetchAllPermissions = async () => {
        try {
            const data = await getAllPermissions();
            setAllPermissions(data);
        } catch (err) {
            console.error("Error fetching permissions:", err);
            setError("Failed to fetch permissions.");
        }
    };

    const handleCreateDepartment = async () => {
        if (!newDepartmentName) {
            setError("Department name is required.");
            return;
        }
        try {
            await createDepartment({ departmentName: newDepartmentName });
            setSuccessMessage("Department created successfully.");
            setError("");
            setNewDepartmentName("");
            fetchDepartments();
        } catch (err) {
            console.error("Error creating department:", err);
            setError("Failed to create department.");
            setSuccessMessage("");
        }
    };

    const handleUpdateDepartment = async () => {
        if (!editingDepartment.departmentName) {
            setError("Department name is required.");
            return;
        }
        try {
            await updateDepartment(editingDepartment.departmentId, {
                departmentName: editingDepartment.departmentName,
            });
            setSuccessMessage("Department updated successfully.");
            setError("");
            setEditingDepartment(null);
            fetchDepartments();
        } catch (err) {
            console.error("Error updating department:", err);
            setError("Failed to update department.");
            setSuccessMessage("");
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;

        try {
            await deleteDepartment(id);
            setSuccessMessage("Department deleted successfully.");
            setError("");
            fetchDepartments();
        } catch (err) {
            console.error("Error deleting department:", err);
            setError("Failed to delete department.");
            setSuccessMessage("");
        }
    };

    const openPermissionsModal = async (departmentId) => {
        setTargetDepartment(departmentId);
        setError(""); // Reset lỗi cũ
        setSuccessMessage(""); // Reset thông báo cũ

        try {
            const permissionsData = await getPermissionsByDepartmentId(departmentId);

            // Nếu không có quyền nào được gán, đặt departmentPermissions là mảng trống
            setDepartmentPermissions(permissionsData.map((perm) => perm.permissionID));
        } catch (err) {
            console.error("Error fetching department permissions:", err);
            setError("Unable to fetch permissions for the selected department. Please try again later.");
            setDepartmentPermissions([]); // Đảm bảo không lỗi nếu API trả về lỗi
        }
    };

    const handleAddPermission = async (permissionId) => {
        try {
            await assignPermissionsToDepartment(targetDepartment, [permissionId]); // Gán quyền mới
            setDepartmentPermissions([...departmentPermissions, permissionId]); // Cập nhật trạng thái local

            // Gọi API đồng bộ quyền của phòng ban và user
            await updateDepartmentPermissions(targetDepartment, [...departmentPermissions, permissionId]);

            setSuccessMessage("Permission added and synced successfully.");
        } catch (err) {
            console.error("Error adding permission:", err);
            setError("Failed to add permission.");
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
                prevPermissions.filter((id) => id !== permissionId) // Loại bỏ quyền đã xóa khỏi danh sách
            );

            setSuccessMessage("Permission removed successfully.");
        } catch (error) {
            setError("Failed to remove permission.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="container mt-4">
            <h1>Department Management</h1>

            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-4">
                <h4>Create New Department</h4>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter department name"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleCreateDepartment}>
                        Add
                    </button>
                </div>
            </div>

            <h4>Department List</h4>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Department Name</th>
                        <th>Actions</th>
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
                                            Save
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm ms-2"
                                            onClick={() => setEditingDepartment(null)}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => setEditingDepartment(department)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm ms-2"
                                            onClick={() => handleDeleteDepartment(department.departmentId)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm ms-2"
                                            onClick={() => openPermissionsModal(department.departmentId)}
                                        >
                                            Manage Permissions
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Permissions Modal */}
            {targetDepartment && (
                <div className="modal show" style={{ display: "block" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Manage Permissions</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setTargetDepartment(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {allPermissions.length === 0 ? (
                                    <p>No permissions available.</p>
                                ) : (
                                    allPermissions.map((permission) => (
                                        <div className="d-flex align-items-center mb-2" key={permission.permissionID}>
                                            <span className="me-2">{permission.name}</span>
                                            {departmentPermissions.includes(permission.permissionID) ? (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRemovePermission(permission.permissionID)}
                                                >
                                                    Remove
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleAddPermission(permission.permissionID)}
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}

                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setTargetDepartment(null)}
                                >
                                    Close
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
