import React, { useState, useEffect } from "react";
import {
    getAllPayments,
    updatePayment,
} from "../../services/paymentService";
import { getAllProjects, updateProject } from "../../services/projectServices";

function PaymentList() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Hàm định dạng tiền tệ
    const formatCurrency = (value) => {
        return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    // Fetch all projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectData = await getAllProjects();
                setProjects(projectData);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Unable to fetch projects.");
            }
        };

        fetchProjects();
    }, []);

    // Fetch payments for the selected project
    const fetchPaymentsForProject = async (projectId) => {
        try {
            const paymentData = await getAllPayments();
            const filteredPayments = paymentData.filter(
                (payment) => payment.project?.projectId === projectId
            );

            // Tính tổng số tiền đã thanh toán
            const totalPaidAmount = filteredPayments
                .filter((payment) => payment.paymentStatus === "Paid")
                .reduce((sum, payment) => sum + payment.amount, 0);

            setPayments(filteredPayments);

            const updatedProject = projects.find(
                (project) => project.projectId === projectId
            );

            // Cập nhật `paidAmount` của dự án
            updatedProject.paidAmount = totalPaidAmount;

            // Cập nhật UI
            setSelectedProject(updatedProject);
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project.projectId === projectId ? updatedProject : project
                )
            );
        } catch (err) {
            console.error("Error fetching payments:", err);
            setError("Unable to fetch payments.");
        }
    };

    const handlePaymentStatusUpdate = async (paymentId, amount) => {
        if (!selectedProject) return;

        // Hiển thị thông báo xác nhận
        const confirmPayment = window.confirm(
            `Bạn có chắc chắn muốn đánh dấu thanh toán với số tiền ${formatCurrency(amount)} không?`
        );

        if (!confirmPayment) {
            return; // Người dùng nhấn "Hủy bỏ"
        }

        try {
            // Update payment status to "Paid"
            await updatePayment(paymentId, { paymentStatus: "Paid" });

            // Fetch updated payments for the selected project
            const paymentData = await getAllPayments();
            const filteredPayments = paymentData.filter(
                (payment) => payment.project?.projectId === selectedProject.projectId
            );

            // Tính toán lại số tiền đã thanh toán
            const totalPaidAmount = filteredPayments
                .filter((payment) => payment.paymentStatus === "Paid")
                .reduce((sum, payment) => sum + payment.amount, 0);

            // Lấy ngày hiện tại theo múi giờ Việt Nam
            const currentDate = new Date().toLocaleDateString("en-CA", {
                timeZone: "Asia/Ho_Chi_Minh",
            }); // Định dạng YYYY-MM-DD

            // Cập nhật thông tin dự án
            const updatedProject = {
                ...selectedProject,
                paidAmount: totalPaidAmount,
            };

            // Nếu số tiền đã thanh toán đủ, chuyển trạng thái dự án và cập nhật endDate
            if (totalPaidAmount >= selectedProject.totalAmount) {
                updatedProject.status = "Completed";
                updatedProject.endDate = currentDate; // Cập nhật ngày hiện tại
            }

            await updateProject(selectedProject.projectId, updatedProject);

            // Cập nhật UI
            setPayments(filteredPayments);
            setSelectedProject(updatedProject);
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project.projectId === updatedProject.projectId
                        ? updatedProject
                        : project
                )
            );

            setSuccessMessage("Payment marked as Paid successfully!");
            setTimeout(() => setSuccessMessage(""), 3000); // Clear success message
        } catch (err) {
            console.error("Error updating payment status:", err);
            setError("Unable to update payment status.");
        }
    };

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container">
            {/* Success Message */}
            {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
            )}

            <h1
                className="text-center"

            >
                Danh sách Dự Án
            </h1>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên Dự Án</th>
                            <th>Tổng Tiền</th>
                            <th>Số tiền đã thanh toán</th>
                            <th>Số tiền còn lại</th>
                            <th>Trạng thái dự án</th>
                            <th>Khách Hàng</th>
                            <th>Chi Tiết Thanh Toán</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr
                                key={project.projectId}
                                className={`${selectedProject?.projectId === project.projectId
                                    ? "table-active table-info" // Highlight với viền xanh blue
                                    : ""
                                    }`}
                                onClick={() => fetchPaymentsForProject(project.projectId)}
                            >
                                <td>{project.projectId}</td>
                                <td>{project.projectName}</td>
                                <td>{formatCurrency(project.totalAmount)}</td>
                                <td>{formatCurrency(project.paidAmount)}</td>

                                <td>
                                    {formatCurrency(
                                        project.totalAmount - project.paidAmount
                                    )}
                                </td>
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

                                <td>{project.customer?.name || "Không rõ"}</td>
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fetchPaymentsForProject(project.projectId);
                                        }}
                                    >
                                        <i class="bi bi-eye"></i>   Xem Chi Tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Display payments for the selected project */}
            {selectedProject && (
                <>
                    <h3 className="mt-4">
                        Chi Tiết Thanh Toán Dự Án: {selectedProject.projectName}
                    </h3>
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Đợt</th>
                                    <th>Số Tiền</th>
                                    <th>Ngày Thanh Toán</th>
                                    <th>Trạng Thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td>{payment.paymentId}</td>
                                        <td>{payment.installmentNumber}</td>
                                        <td>{formatCurrency(payment.amount)}</td>
                                        <td>{payment.paymentDate}</td>
                                        <td>{payment.paymentStatus}</td>
                                        <td>
                                            {payment.paymentStatus !== "Paid" && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() =>
                                                        handlePaymentStatusUpdate(
                                                            payment.paymentId,
                                                            payment.amount
                                                        )
                                                    }
                                                >
                                                    <i class="bi bi-wallet2"></i>   Thanh Toán
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        className="btn btn-secondary mt-3"
                        onClick={() => setSelectedProject(null)}
                    >
                        <i class="bi bi-arrow-bar-left"></i> Quay Lại
                    </button>
                </>
            )}
        </div>
    );
}

export default PaymentList;
