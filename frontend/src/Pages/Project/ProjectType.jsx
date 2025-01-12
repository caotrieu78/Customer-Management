import React, { useState, useEffect } from "react";
import {
    getAllProjectTypes,
    createProjectType,
    updateProjectType,
    deleteProjectType,
} from "../../services/projectServices";
import { PATHS } from "../../constant/pathnames";
import { NavLink } from "react-router-dom";

function ProjectType() {
    const [projectTypes, setProjectTypes] = useState([]); // Danh sách loại dự án
    const [error, setError] = useState(""); // Lỗi
    const [selectedType, setSelectedType] = useState(null); // Loại dự án được chọn để sửa
    const [showAddEditModal, setShowAddEditModal] = useState(false); // Hiển thị modal thêm/sửa
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Hiển thị modal xóa
    const [newTypeName, setNewTypeName] = useState(""); // Giá trị tên loại dự án mới

    // Thanh tìm kiếm
    const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const projectTypesPerPage = 10; // Number of project types per page

    // Fetch the list of project types
    useEffect(() => {
        const fetchProjectTypes = async () => {
            try {
                const data = await getAllProjectTypes();
                setProjectTypes(data);
            } catch (err) {
                console.error("Error fetching project types:", err);
                setError("Không thể tải danh sách loại dự án.");
            }
        };

        fetchProjectTypes();
    }, []);

    // Lọc danh sách loại dự án theo từ khóa tìm kiếm
    const filteredProjectTypes = projectTypes.filter((type) =>
        type.typeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle pagination logic
    const indexOfLastProjectType = currentPage * projectTypesPerPage;
    const indexOfFirstProjectType = indexOfLastProjectType - projectTypesPerPage;
    const currentProjectTypes = filteredProjectTypes.slice(indexOfFirstProjectType, indexOfLastProjectType);

    const totalPages = Math.ceil(filteredProjectTypes.length / projectTypesPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    // Open add/edit modal
    const handleShowAddEditModal = (type = null) => {
        setSelectedType(type); // If edit, set selected project type
        setNewTypeName(type ? type.typeName : ""); // If edit, fill the input with the name
        setShowAddEditModal(true);
    };

    // Close add/edit modal
    const handleCloseAddEditModal = () => {
        setShowAddEditModal(false);
        setSelectedType(null);
        setNewTypeName("");
    };

    // Save project type (add or update)
    const handleSaveType = async () => {
        try {
            if (selectedType) {
                // Update project type
                await updateProjectType(selectedType.projectTypeId, { typeName: newTypeName });
                setProjectTypes((prev) =>
                    prev.map((type) =>
                        type.projectTypeId === selectedType.projectTypeId
                            ? { ...type, typeName: newTypeName }
                            : type
                    )
                );
            } else {
                // Add new project type
                const newType = await createProjectType({ typeName: newTypeName });
                setProjectTypes((prev) => [...prev, newType]);
            }
            handleCloseAddEditModal();
        } catch (err) {
            console.error("Error saving project type:", err);
            setError("Không thể lưu loại dự án.");
        }
    };

    // Confirm delete
    const handleDeleteType = async () => {
        try {
            await deleteProjectType(selectedType.projectTypeId);
            setProjectTypes((prev) =>
                prev.filter((type) => type.projectTypeId !== selectedType.projectTypeId)
            );
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Error deleting project type:", err);
            setError("Không thể xóa loại dự án.");
        }
    };

    return (
        <div className="container ">
            {/* Error Message */}
            {error && <div className="alert alert-danger">{error}</div>}

            <h1
                className="text-center mb-3"

            >
                QUẢN LÝ LOẠI DỰ ÁN
            </h1>

            <div className="d-flex justify-content-between align-items-center mb-4">

                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Tìm kiếm loại dự án..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="d-flex justify-content-between align-items-center mb-3 ">

                    <button
                        className="btn btn-primary me-3"
                        onClick={() => handleShowAddEditModal()}
                    >
                        <i className="bi bi-plus-square"></i> Thêm Loại
                    </button>
                    <NavLink to={`${PATHS.PROJECT}`} className="btn btn-primary">
                        Quay Về Trang Quản Lý Dự Án <i class="bi bi-arrow-bar-right"></i>
                    </NavLink>
                </div>

            </div>

            {/* Project Types Table */}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Tên loại dự án</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProjectTypes.length > 0 ? (
                            currentProjectTypes.map((type) => (
                                <tr key={type.projectTypeId}>
                                    <td>{type.projectTypeId}</td>
                                    <td>{type.typeName}</td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => handleShowAddEditModal(type)}
                                        >
                                            <i className="bi bi-pencil-square"></i> Sửa
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                setSelectedType(type);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            <i className="bi bi-trash3"></i> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">
                                    Không tìm thấy loại dự án nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>

            {/* Add/Edit Modal */}
            {showAddEditModal && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedType ? "Sửa Loại Dự Án" : "Thêm Loại Dự Án"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseAddEditModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-floating">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tên loại dự án"
                                        value={newTypeName}
                                        onChange={(e) => setNewTypeName(e.target.value)}
                                    />
                                    <label htmlFor="newTypeName">Tên loại dự án</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={handleCloseAddEditModal}>
                                    <i className="bi bi-x-square"></i> Hủy
                                </button>
                                <button className="btn btn-primary" onClick={handleSaveType}>
                                    <i className="bi bi-floppy"></i> Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Xóa Loại Dự Án</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Bạn có chắc chắn muốn xóa loại dự án{" "}
                                    <strong>{selectedType?.typeName}</strong>?
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                    <i className="bi bi-x-square"></i> Hủy
                                </button>
                                <button className="btn btn-danger" onClick={handleDeleteType}>
                                    <i className="bi bi-trash3"></i> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectType;
