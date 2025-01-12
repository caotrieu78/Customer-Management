import React, { useState, useEffect } from "react";
import { getAllProjects } from "../../services/projectServices";
import { getAllPayments, createPayment, deletePayment } from "../../services/paymentService";
import { NavLink, useNavigate } from "react-router-dom";
import { PATHS } from "../../constant/pathnames";

function Payment() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [installments, setInstallments] = useState(1); // Số đợt thanh toán
    const [installmentDetails, setInstallmentDetails] = useState([]);
    const [splitMethod, setSplitMethod] = useState("equal"); // Chia đều hoặc chia theo phần trăm
    const [percentages, setPercentages] = useState([]); // Tỷ lệ chia
    const [remainingAmount, setRemainingAmount] = useState(0); // Số tiền còn lại
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Trạng thái cho sắp xếp
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Trạng thái cho lọc
    const [filters, setFilters] = useState({
        projectName: '',
        customerName: '',
        status: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectData = await getAllProjects();
                setProjects(projectData);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Không thể tải dữ liệu dự án.");
            }
        };
        fetchProjects();
    }, []);

    // Hàm xử lý khi chọn dự án
    const handleProjectSelect = async (projectId) => {
        const project = projects.find((p) => p.projectId === parseInt(projectId));
        setSelectedProject(project);

        try {
            const payments = await getAllPayments();
            const projectPayments = payments.filter(
                (payment) => payment.project?.projectId === projectId
            );

            // Tính tổng số tiền đã thanh toán
            const totalPaid = projectPayments
                .filter((payment) => payment.paymentStatus === "Paid")
                .reduce((sum, payment) => sum + payment.amount, 0);

            // Tính số tiền còn lại
            const remaining = project.totalAmount - totalPaid;
            setRemainingAmount(remaining);

            // Hiển thị các đợt đã thanh toán
            const paidInstallments = projectPayments.map((payment) => ({
                installmentNumber: payment.installmentNumber,
                amount: payment.amount,
                paymentDate: payment.paymentDate,
                isPaid: payment.paymentStatus === "Paid",
                paymentId: payment.paymentId,
            }));

            setInstallmentDetails(paidInstallments);

            // Nếu còn số tiền chưa thanh toán, thêm các đợt mới
            if (remaining > 0) {
                calculateInstallments(remaining, splitMethod, installments - paidInstallments.length);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            setError("Không thể tải dữ liệu thanh toán.");
        }
    };

    // Hàm tính toán các đợt thanh toán
    const calculateInstallments = (totalAmount, method, numInstallments) => {
        // Lấy các đợt đã thanh toán
        const paidInstallments = installmentDetails.filter((detail) => detail.isPaid);

        let newInstallments = [];
        if (method === "equal") {
            const amountPerInstallment = Math.floor(totalAmount / numInstallments);
            newInstallments = Array.from({ length: numInstallments }, (_, index) => ({
                installmentNumber: paidInstallments.length + index + 1,
                amount: amountPerInstallment,
                paymentDate: new Date().toISOString().split("T")[0],
                isPaid: false,
            }));
        } else if (method === "percentage") {
            newInstallments = percentages.map((percentage, index) => ({
                installmentNumber: paidInstallments.length + index + 1,
                amount: Math.round((totalAmount * percentage) / 100),
                paymentDate: new Date().toISOString().split("T")[0],
                isPaid: false,
            }));
        }

        // Kết hợp đợt đã thanh toán với các đợt mới
        setInstallmentDetails([...paidInstallments, ...newInstallments]);
    };

    // Hàm xử lý khi thay đổi số đợt thanh toán
    const handleInstallmentsChange = (value) => {
        const numInstallments = Math.max(1, parseInt(value));
        setInstallments(numInstallments);

        if (splitMethod === "equal") {
            calculateInstallments(remainingAmount, "equal", numInstallments);
        } else {
            setPercentages(Array(numInstallments).fill(0)); // Reset tỷ lệ nếu chuyển sang chia theo phần trăm
        }
    };

    // Hàm xử lý khi thay đổi phương pháp chia
    const handleSplitMethodChange = (method) => {
        setSplitMethod(method);
        if (method === "equal") {
            calculateInstallments(remainingAmount, "equal", installments);
        } else {
            setPercentages(Array(installments).fill(0)); // Reset tỷ lệ nếu chuyển sang chia theo phần trăm
        }
    };

    // Hàm xử lý khi thay đổi tỷ lệ phần trăm
    const handlePercentagesChange = (index, value) => {
        const updatedPercentages = [...percentages];
        updatedPercentages[index] = Math.max(0, Math.min(100, parseFloat(value) || 0));
        const totalPercentage = updatedPercentages.reduce((sum, p) => sum + p, 0);

        if (totalPercentage > 100) {
            setError("Tổng tỷ lệ không được vượt quá 100%.");
            return;
        }

        setError("");
        setPercentages(updatedPercentages);

        // Tính lại số tiền cho từng đợt
        const updatedDetails = updatedPercentages.map((percentage, idx) => ({
            installmentNumber: installmentDetails.length + idx + 1,
            amount: Math.round((remainingAmount * percentage) / 100),
            paymentDate: new Date().toISOString().split("T")[0],
            isPaid: false,
        }));
        setInstallmentDetails([...installmentDetails.filter((i) => i.isPaid), ...updatedDetails]);
    };

    // Hàm xử lý xác nhận thanh toán
    const handleConfirmPayment = async () => {
        try {
            // Lọc ra các đợt đã thanh toán
            const paidInstallments = installmentDetails.filter((detail) => detail.isPaid);

            // Xóa tất cả các đợt chưa thanh toán cũ
            const unpaidInstallments = installmentDetails.filter((detail) => !detail.isPaid);
            for (const detail of unpaidInstallments) {
                if (detail.paymentId) {
                    await deletePayment(detail.paymentId);
                }
            }

            // Tạo danh sách các đợt mới
            const newInstallments = unpaidInstallments.map((installment) => ({
                customer: { customerId: selectedProject.customer.customerId },
                project: { projectId: selectedProject.projectId },
                installmentNumber: installment.installmentNumber,
                amount: installment.amount,
                paymentDate: installment.paymentDate,
            }));

            for (const installment of newInstallments) {
                await createPayment(installment); // Lưu từng đợt thanh toán mới
            }

            setInstallmentDetails([...paidInstallments, ...newInstallments]);
            setSuccessMessage("Các đợt thanh toán đã được cập nhật thành công!");
            navigate(PATHS.PAYMENT_LIST);
        } catch (err) {
            console.error("Error updating payments:", err);
            setError("Có lỗi xảy ra khi cập nhật thanh toán.");
        }
    };

    // Hàm định dạng tiền tệ
    const formatCurrency = (value) => Math.round(value).toLocaleString("vi-VN");

    // Hàm xử lý sắp xếp
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Hàm xử lý lọc
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    // Sắp xếp và lọc dữ liệu dự án trước khi hiển thị
    const sortedAndFilteredProjects = React.useMemo(() => {
        let filteredProjects = projects.filter(project => {
            return (
                project.projectName.toLowerCase().includes(filters.projectName.toLowerCase()) &&
                (filters.customerName === '' || (project.customer?.name && project.customer.name.toLowerCase().includes(filters.customerName.toLowerCase()))) &&
                (filters.status === '' || project.status === filters.status)
            );
        });

        if (sortConfig.key !== null) {
            filteredProjects.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Xử lý trường hợp giá trị là chuỗi
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                }
                if (typeof bValue === 'string') {
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredProjects;
    }, [projects, sortConfig, filters]);

    return (
        <div className="container">
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <h1
                className="text-center"

            >
                Quản Lý Thanh Toán
            </h1>
            <NavLink to={PATHS.PAYMENT_LIST} className="btn btn-primary mb-4 mt-3">
                <i class="bi bi-eye"></i> Xem Danh Sách Dự Án
            </NavLink>

            {/* Phần lọc */}
            <div className="row mb-3">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm tên dự án..."
                        name="projectName"
                        value={filters.projectName}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm tên khách hàng..."
                        name="customerName"
                        value={filters.customerName}
                        onChange={handleFilterChange}
                    />
                </div>

            </div>

            {/* Bảng danh sách dự án với sắp xếp */}
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th onClick={() => handleSort("projectId")} style={{ cursor: "pointer" }}>
                            ID {sortConfig.key === "projectId" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("projectName")} style={{ cursor: "pointer" }}>
                            Tên Dự Án {sortConfig.key === "projectName" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("totalAmount")} style={{ cursor: "pointer" }}>
                            Tổng Số Tiền {sortConfig.key === "totalAmount" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th onClick={() => handleSort("customer.name")} style={{ cursor: "pointer" }}>
                            Khách Hàng {sortConfig.key === "customer.name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                        </th>

                        <th>Chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredProjects.map((project) => (
                        <tr key={project.projectId}>
                            <td>{project.projectId}</td>
                            <td>{project.projectName}</td>
                            <td>{formatCurrency(project.totalAmount)}</td>
                            <td>{project.customer?.name || "Không rõ"}</td>

                            <td>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleProjectSelect(project.projectId)}
                                >
                                    Chọn <i class="bi bi-chevron-double-left"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedProject && (
                <div>
                    <h4>Dự án: {selectedProject.projectName}</h4>
                    <h5>Số tiền còn lại: {formatCurrency(remainingAmount)}</h5>
                    <label>Phương pháp phân bổ:</label>
                    <select
                        className="form-select"
                        value={splitMethod}
                        onChange={(e) => handleSplitMethodChange(e.target.value)}
                    >
                        <option value="equal">Chia đều</option>
                        <option value="percentage">Chia theo phần trăm</option>
                    </select>
                    <div className="mt-3">
                        <label>Số đợt thanh toán:</label>
                        <input
                            type="number"
                            className="form-control w-25"
                            value={installments}
                            onChange={(e) => handleInstallmentsChange(e.target.value)}
                        />
                    </div>
                    {splitMethod === "percentage" &&
                        percentages.map((percentage, index) => (
                            <div key={index} className="mb-2">
                                <label>
                                    Đợt {index + 1} (%):
                                    <input
                                        type="number"
                                        className="form-control d-inline-block w-25 ms-2"
                                        value={percentage || ""}
                                        onChange={(e) => handlePercentagesChange(index, e.target.value)}
                                    />
                                </label>
                            </div>
                        ))}
                    <h5 className="mt-4">Chi tiết các đợt thanh toán:</h5>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Đợt</th>
                                <th>Số Tiền</th>
                                <th>Ngày Thanh Toán</th>
                                <th>Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {installmentDetails.map((detail, index) => (
                                <tr key={index}>
                                    <td>{detail.installmentNumber}</td>
                                    <td>{formatCurrency(detail.amount)}</td>
                                    <td>{detail.paymentDate}</td>
                                    <td>
                                        {detail.isPaid ? (
                                            <span className="text-success">Đã thanh toán</span>
                                        ) : (
                                            <span className="text-warning">Chưa thanh toán</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-success" onClick={handleConfirmPayment}>
                        Xác Nhận Thanh Toán
                    </button>
                </div>
            )}
        </div>
    );
}

export default Payment;
