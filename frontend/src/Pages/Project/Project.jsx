import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getAllProjects, deleteProject } from "../../services/projectServices";
import { PATHS } from "../../constant/pathnames";

function Project() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null); // Project details being viewed

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 5; // Number of projects per page

    // Fetch the list of projects when the component mounts
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getAllProjects();
                console.log("Fetched projects:", data);  // Debugging: log fetched data
                setProjects(data);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Không thể tải danh sách dự án.");
            }
        };

        fetchProjects();
    }, []);

    // Function to confirm deletion of a project
    const confirmDelete = (projectId) => {
        setProjectToDelete(projectId);
    };

    // Handle deletion of a project
    const handleDelete = async () => {
        try {
            await deleteProject(projectToDelete);
            setProjects((prevProjects) =>
                prevProjects.filter((project) => project.projectId !== projectToDelete)
            );
            setSuccessMessage("Dự án đã được xóa thành công!");
            setProjectToDelete(null);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error("Error deleting project:", err);
            setError("Không thể xóa dự án.");
        }
    };

    // Function to show project details in a modal
    const viewProjectDetails = (project) => {
        setProjectDetails(project);
    };

    // Format currency with dot separator
    const formatCurrency = (value) => {
        let num = value.toString().replace(/\./g, '').replace(',', '.');
        if (isNaN(num)) return value;
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Pagination logic
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

    const totalPages = Math.ceil(projects.length / projectsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container">
            {/* Success Message */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            {/* Add Project and View Project Types Buttons */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Danh sách dự án</h1>
                <div className="d-flex gap-2">
                    <NavLink to={PATHS.ADD_PROJECT} className="btn btn-primary">
                        Thêm dự án
                    </NavLink>
                    <NavLink to={PATHS.PROJECT_TYPES} className="btn btn-secondary">
                        Xem danh sách loại dự án
                    </NavLink>
                </div>
            </div>

            {/* Project Table */}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Tên dự án</th>
                            <th>Khách hàng</th>
                            <th>Người quản lý</th>
                            <th>Loại dự án</th>
                            <th>Trạng thái</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProjects.map((project) => (
                            <tr key={project.projectId}>
                                <td>{project.projectId}</td>
                                <td>{project.projectName}</td>
                                <td>{project.customer?.name || "Không có khách hàng"}</td>
                                <td>{project.user?.fullName || "Không có người quản lý"}</td>
                                <td>{project.projectType?.typeName || "Không có loại dự án"}</td>
                                <td>{project.status}</td>
                                <td>{project.startDate}</td>
                                <td>{project.endDate || "Chưa có ngày kết thúc"}</td>
                                <td>
                                    <button
                                        className="btn btn-info btn-sm me-2"
                                        onClick={() => viewProjectDetails(project)}
                                    >
                                        Xem
                                    </button>
                                    <NavLink
                                        to={`${PATHS.EDIT_PROJECT}/${project.projectId}`}
                                        className="btn btn-warning btn-sm me-2"
                                    >
                                        Sửa
                                    </NavLink>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => confirmDelete(project.projectId)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
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

            {/* Delete Confirmation Modal */}
            {projectToDelete && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    tabIndex="-1"
                    aria-labelledby="deleteConfirmationModal"
                    aria-hidden="true"
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Xác nhận xóa</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setProjectToDelete(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Bạn có chắc chắn muốn xóa dự án này?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setProjectToDelete(null)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Project Details Modal */}
            {projectDetails && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    tabIndex="-1"
                    aria-labelledby="projectDetailsModal"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết dự án</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setProjectDetails(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>ID:</strong> {projectDetails.projectId}</p>
                                <p><strong>Tên dự án:</strong> {projectDetails.projectName}</p>
                                <p><strong>Mô tả:</strong> {projectDetails.description}</p>
                                <p><strong>Trạng thái:</strong> {projectDetails.status}</p>
                                <p><strong>Ngày bắt đầu:</strong> {projectDetails.startDate}</p>
                                <p><strong>Ngày kết thúc:</strong> {projectDetails.endDate || "Chưa có ngày kết thúc"}</p>
                                <p><strong>Số tiền tổng:</strong> {formatCurrency(projectDetails.totalAmount)}</p>
                                <p><strong>Số tiền đã trả:</strong> {formatCurrency(projectDetails.paidAmount)}</p>
                                <p><strong>Số tiền còn lại:</strong> {formatCurrency(projectDetails.remainingAmount)}</p>
                                <p><strong>Người quản lý:</strong> {projectDetails.user.fullName || "Không có"}</p>
                                <p><strong>Khách hàng:</strong> {projectDetails.customer.name || "Không có"}</p>
                                <p><strong>Loại dự án:</strong> {projectDetails.projectType.typeName}</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setProjectDetails(null)}
                                >
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

export default Project;
