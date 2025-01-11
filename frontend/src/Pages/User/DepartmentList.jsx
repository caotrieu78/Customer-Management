import React, { useState, useEffect } from "react";
import {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignPermissionsToDepartment,
    getPermissionsByDepartmentId,
} from "../../services/departmentService";
import { getAllPermissions } from "../../services/authService";

function DepartmentList() {
    const [departments, setDepartments] = useState([]);
    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [permissions, setPermissions] = useState([]); // Danh sách quyền
    const [selectedPermissions, setSelectedPermissions] = useState([]); // Quyền được chọn
    const [showPermissionsModal, setShowPermissionsModal] = useState(false); // Hiện modal gán quyền
    const [showDetailsModal, setShowDetailsModal] = useState(false); // Hiện modal chi tiết quyền
    const [targetDepartment, setTargetDepartment] = useState(null); // Phòng ban đang gán quyền
    const [departmentPermissions, setDepartmentPermissions] = useState([]); // Quyền của phòng ban
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Fetch departments and permissions on mount
    useEffect(() => {
        fetchDepartments();
        fetchPermissions();
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

    const fetchPermissions = async () => {
        try {
            const data = await getAllPermissions();
            setPermissions(data);
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
            setMessage("Department created successfully.");
            setError("");
            setNewDepartmentName("");
            fetchDepartments();
        } catch (err) {
            console.error("Error creating department:", err);
            setError("Failed to create department. Ensure the name is unique.");
            setMessage("");
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
            setMessage("Department updated successfully.");
            setError("");
            setEditingDepartment(null);
            fetchDepartments();
        } catch (err) {
            console.error("Error updating department:", err);
            setError("Failed to update department. Ensure the name is unique.");
            setMessage("");
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;

        try {
            await deleteDepartment(id);
            setMessage("Department deleted successfully.");
            setError("");
            fetchDepartments();
        } catch (err) {
            console.error("Error deleting department:", err);
            setError("Failed to delete department.");
            setMessage("");
        }
    };

    const openPermissionsModal = (departmentId) => {
        setTargetDepartment(departmentId);
        setSelectedPermissions([]); // Reset danh sách quyền được chọn
        setShowPermissionsModal(true);
    };

    // Handle permission selection
    const handlePermissionChange = (e) => {
        const { value, checked } = e.target;
        const permissionId = parseInt(value, 10); // Chuyển đổi giá trị sang số
        if (isNaN(permissionId)) {
            console.error("Invalid permissionId:", value);
            return;
        }

        setSelectedPermissions((prev) =>
            checked
                ? [...prev, permissionId] // Thêm quyền
                : prev.filter((id) => id !== permissionId) // Loại bỏ quyền
        );
    };

    const handleAssignPermissions = async () => {
        if (!targetDepartment || selectedPermissions.length === 0) {
            setError("Please select a department and at least one permission.");
            return;
        }

        try {
            console.log("Assigning permissions:", {
                departmentId: targetDepartment,
                permissionIds: selectedPermissions,
            });

            await assignPermissionsToDepartment(targetDepartment, selectedPermissions);

            setMessage("Permissions assigned successfully.");
            setError("");
            setShowPermissionsModal(false);
            setSelectedPermissions([]);
        } catch (err) {
            console.error("Error assigning permissions:", err);
            setError("Failed to assign permissions. Please try again.");
            setMessage("");
        }
    };

    const openDetailsModal = async (departmentId) => {
        try {
            const data = await getPermissionsByDepartmentId(departmentId);
            setDepartmentPermissions(data);
            setShowDetailsModal(true);
        } catch (err) {
            console.error("Error fetching department permissions:", err);
            setError("Failed to fetch department permissions.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Department Management</h1>
            {message && <div className="alert alert-success">{message}</div>}
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
                                            Assign Permissions
                                        </button>
                                        <button
                                            className="btn btn-info btn-sm ms-2"
                                            onClick={() => openDetailsModal(department.departmentId)}
                                        >
                                            View Details
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Permissions Modal */}
            {showPermissionsModal && (
                <div className="modal show" style={{ display: "block" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Permissions</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => setShowPermissionsModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {permissions.map((permission) => (
                                    <div className="form-check" key={permission.permissionID}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`permission-${permission.permissionID}`}
                                            value={permission.permissionID}
                                            onChange={handlePermissionChange}
                                        />
                                        <label className="form-check-label" htmlFor={`permission-${permission.permissionID}`}>
                                            {permission.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowPermissionsModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAssignPermissions}
                                >
                                    Assign Permissions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && (
                <div className="modal show" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Department Permissions</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDetailsModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <ul>
                                    {departmentPermissions.map((permission) => (
                                        <li key={permission.permissionId}>{permission.name}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
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
