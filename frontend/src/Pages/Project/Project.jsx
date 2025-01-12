import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getAllProjects, deleteProject, getAllProjectTypes } from "../../services/projectServices";
import { PATHS } from "../../constant/pathnames";

function Project() {
    const [projects, setProjects] = useState([]);
    const [projectTypes, setProjectTypes] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 10;

    // Filters and Search
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [columnSearch, setColumnSearch] = useState({
        projectName: "",
        customerName: "",
        managerName: "",
        typeName: "",
        status: "",
    });
    const [visibleSearch, setVisibleSearch] = useState({
        projectName: false,
        customerName: false,
        managerName: false,
        typeName: false,
        status: false,
    });

    // Fetch projects and project types when the component mounts
    useEffect(() => {
        const fetchProjectsAndTypes = async () => {
            try {
                const [projectData, projectTypeData] = await Promise.all([
                    getAllProjects(),
                    getAllProjectTypes(),
                ]);
                setProjects(projectData);
                setProjectTypes(projectTypeData);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Không thể tải dữ liệu.");
            }
        };

        fetchProjectsAndTypes();
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

    // Toggle visibility of search fields
    const toggleSearch = (column) => {
        setVisibleSearch((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    // Filtered and searched projects
    const filteredProjects = projects.filter((project) => {
        if (statusFilter && project.status !== statusFilter) return false;
        if (typeFilter && project.projectType?.typeName !== typeFilter) return false;
        if (searchTerm && !project.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
            return false;

        // Column-specific filtering
        if (columnSearch.projectName && !project.projectName.toLowerCase().includes(columnSearch.projectName.toLowerCase()))
            return false;
        if (columnSearch.customerName && !(project.customer?.name || "").toLowerCase().includes(columnSearch.customerName.toLowerCase()))
            return false;
        if (columnSearch.managerName && !(project.user?.fullName || "").toLowerCase().includes(columnSearch.managerName.toLowerCase()))
            return false;
        if (columnSearch.typeName && !(project.projectType?.typeName || "").toLowerCase().includes(columnSearch.typeName.toLowerCase()))
            return false;
        if (columnSearch.status && !project.status.toLowerCase().includes(columnSearch.status.toLowerCase()))
            return false;

        return true;
    });

    // Pagination logic
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(
        indexOfFirstProject,
        indexOfLastProject
    );

    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const clearFilters = () => {
        setStatusFilter("");
        setTypeFilter("");
        setSearchTerm("");
        setColumnSearch({
            projectName: "",
            customerName: "",
            managerName: "",
            typeName: "",
            status: "",
        });
    };

    return (
        <div className="container">
            {/* Success Message */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            {/* Add Project and View Project Types Buttons */}
            <h1 className="text-center mb-3">
                quản lý DỰ ÁN
            </h1>

            {/* Filters and Search */}
            <div className="card shadow-sm mb-4 p-3">
                <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
                    {/* Bộ lọc trạng thái */}
                    <div className="flex-grow-1">
                        <label className="form-label fw-bold">Trạng thái</label>
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="Ongoing">Đang Tiến Hành</option>
                            <option value="Completed">Đã Hoàn Thành</option>
                            <option value="Accepted_NotPaid">Đã chấp nhận nhưng chưa thanh toán</option>
                            <option value="Canceled">Dự Án Hủy Bỏ</option>
                        </select>
                    </div>

                    {/* Bộ lọc loại dự án */}
                    <div className="flex-grow-1">
                        <label className="form-label fw-bold">Loại dự án</label>
                        <select
                            className="form-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Tất cả loại dự án</option>
                            {projectTypes.map((type) => (
                                <option key={type.typeId} value={type.typeName}>
                                    {type.typeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Các nút hành động */}
                    <div className="d-flex flex-column gap-2">
                        <NavLink to={PATHS.ADD_PROJECT} className="btn btn-primary">
                            <i className="bi bi-plus-lg"></i> Thêm dự án
                        </NavLink>
                        <NavLink to={PATHS.PROJECT_TYPES} className="btn btn-secondary">
                            <i className="bi bi-list"></i> Xem loại dự án
                        </NavLink>
                    </div>
                </div>
            </div>


            {/* Project Table */}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Tên dự án
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("projectName")}
                                    ></i>
                                </div>
                                {visibleSearch.projectName && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm tên dự án"
                                        value={columnSearch.projectName}
                                        onChange={(e) =>
                                            setColumnSearch({ ...columnSearch, projectName: e.target.value })
                                        }
                                    />
                                )}
                            </th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Khách hàng
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("customerName")}
                                    ></i>
                                </div>
                                {visibleSearch.customerName && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm khách hàng"
                                        value={columnSearch.customerName}
                                        onChange={(e) =>
                                            setColumnSearch({ ...columnSearch, customerName: e.target.value })
                                        }
                                    />
                                )}
                            </th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Người quản lý
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("managerName")}
                                    ></i>
                                </div>
                                {visibleSearch.managerName && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm người quản lý"
                                        value={columnSearch.managerName}
                                        onChange={(e) =>
                                            setColumnSearch({ ...columnSearch, managerName: e.target.value })
                                        }
                                    />
                                )}
                            </th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Loại dự án
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("typeName")}
                                    ></i>
                                </div>
                                {visibleSearch.typeName && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm loại dự án"
                                        value={columnSearch.typeName}
                                        onChange={(e) =>
                                            setColumnSearch({ ...columnSearch, typeName: e.target.value })
                                        }
                                    />
                                )}
                            </th>
                            <th>Trạng thái </th>
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
                                <td>
                                    <span
                                        className={`badge ${project.status === "Ongoing"
                                            ? "bg-primary"
                                            : project.status === "Completed"
                                                ? "bg-success"
                                                : project.status === "Accepted_NotPaid"
                                                    ? "bg-warning text-dark"
                                                    : "bg-danger"
                                            }`}
                                    >
                                        {project.status === "Ongoing"
                                            ? "Đang thực hiện"
                                            : project.status === "Completed"
                                                ? "Hoàn thành"
                                                : project.status === "Accepted_NotPaid"
                                                    ? "Chấp nhận nhưng chưa thanh toán"
                                                    : "Đã hủy"}
                                    </span>
                                </td>
                                <td>{project.startDate}</td>
                                <td>{project.endDate || "Chưa có ngày kết thúc"}</td>
                                <td>
                                    <button
                                        className="btn btn-info btn-sm me-2"
                                        onClick={() => viewProjectDetails(project)}
                                    >
                                        <i class="bi bi-eye"></i> Xem
                                    </button>
                                    <NavLink
                                        to={`${PATHS.EDIT_PROJECT}/${project.projectId}`}
                                        className="btn btn-warning btn-sm me-2"
                                    >
                                        <i class="bi bi-pencil-square"></i> Sửa
                                    </NavLink>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => confirmDelete(project.projectId)}
                                    >
                                        <i class="bi bi-trash"></i> Xóa
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
                <span>
                    Page {currentPage} of {totalPages}
                </span>
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
                                <p><strong>Số tiền tổng:</strong> {projectDetails.totalAmount}</p>
                                <p><strong>Số tiền đã trả:</strong> {projectDetails.paidAmount}</p>
                                <p><strong>Số tiền còn lại:</strong> {projectDetails.remainingAmount}</p>
                                <p><strong>Người quản lý:</strong> {projectDetails.user.fullName || "Không có"} ({projectDetails.user.role || "Không có"})</p>
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
