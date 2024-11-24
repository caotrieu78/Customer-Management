import React, { useState, useEffect } from "react";
import { getAllProjects } from "../../services/projectServices";
import { getAllPayments, createPayment } from "../../services/paymentService";
import { NavLink, useNavigate } from "react-router-dom";
import { PATHS } from "../../constant/pathnames";

function Payment() {
    const [projects, setProjects] = useState([]);
    const [payments, setPayments] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [installments, setInstallments] = useState(1);
    const [installmentDetails, setInstallmentDetails] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();

    // Fetch all projects and payments
    useEffect(() => {
        const fetchData = async () => {
            try {
                const projectData = await getAllProjects();
                const paymentData = await getAllPayments();

                setProjects(projectData);
                setPayments(paymentData);

                // Filter out projects with existing payments
                const projectsWithNoPayments = projectData.filter(
                    (project) => !paymentData.some((payment) => payment.project?.projectId === project.projectId)
                );

                setFilteredProjects(projectsWithNoPayments);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Unable to fetch data.");
            }
        };

        fetchData();
    }, []);

    const handleProjectSelect = (projectId) => {
        const project = projects.find((p) => p.projectId === parseInt(projectId));
        setSelectedProject(project);
        setInstallments(1);
        setInstallmentDetails([]);
    };

    const handleInstallmentsChange = (value) => {
        const numInstallments = Math.max(1, parseInt(value));
        setInstallments(numInstallments);

        if (selectedProject) {
            const amountPerInstallment = selectedProject.totalAmount / numInstallments;
            const dueDates = Array.from({ length: numInstallments }, (_, index) => {
                const date = new Date();
                date.setMonth(date.getMonth() + index);
                return date.toISOString().split("T")[0];
            });

            const details = Array.from({ length: numInstallments }, (_, index) => ({
                installmentNumber: index + 1,
                amount: amountPerInstallment,
                paymentDate: dueDates[index],
            }));

            setInstallmentDetails(details);
        }
    };

    const handleAddPayments = async () => {
        if (!selectedProject || installmentDetails.length === 0) {
            setError("Please select a project and configure installments.");
            return;
        }

        const paymentsToAdd = installmentDetails.map((installment) => ({
            customer: { customerId: selectedProject.customer.customerId },
            project: { projectId: selectedProject.projectId },
            installmentNumber: installment.installmentNumber,
            amount: installment.amount,
            paymentDate: installment.paymentDate,
        }));

        try {
            for (const payment of paymentsToAdd) {
                await createPayment(payment);
            }

            setSuccessMessage("Payments added successfully!");
            setError("");

            // Redirect to payment list after success
            navigate(PATHS.PAYMENT_LIST);
        } catch (err) {
            console.error("Error adding payments:", err);
            setError("Unable to add payments.");
        }
    };

    const formatCurrency = (value) => {
        return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    return (
        <div className="container">
            {/* Success Message */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <h2>Danh sách Dự Án Chưa Thanh Toán</h2>
            <NavLink to={PATHS.PAYMENT_LIST} className="btn btn-primary mb-4 mt-3">
                Xem Danh Sách Dự Án
            </NavLink>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên Dự Án</th>
                            <th>Tổng Tiền</th>
                            <th>Khách Hàng</th>
                            <th>Chọn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project) => (
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
                                        Chọn
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedProject && (
                <>
                    <div className="mb-3 mt-4">
                        <p>
                            <strong>Dự án:</strong> {selectedProject.projectName} <br />
                            <strong>Khách hàng:</strong> {selectedProject.customer?.name || "Không rõ"}
                        </p>
                    </div>

                    {/* Number of Installments */}
                    <div className="mb-3">
                        <label htmlFor="installments" className="form-label">Số đợt</label>
                        <input
                            id="installments"
                            type="number"
                            className="form-control"
                            value={installments}
                            min="1"
                            onChange={(e) => handleInstallmentsChange(e.target.value)}
                        />
                    </div>

                    {/* Installment Details */}
                    {installmentDetails.length > 0 && (
                        <div className="mb-3">
                            <h4>Chi tiết các đợt thanh toán</h4>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Đợt</th>
                                        <th>Số Tiền</th>
                                        <th>Ngày Thanh Toán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {installmentDetails.map((installment) => (
                                        <tr key={installment.installmentNumber}>
                                            <td>{installment.installmentNumber}</td>
                                            <td>{formatCurrency(installment.amount)}</td>
                                            <td>{installment.paymentDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Add Payments */}
                    <button className="btn btn-primary" onClick={handleAddPayments}>
                        Thêm Thanh Toán
                    </button>
                </>
            )}
        </div>
    );
}

export default Payment;
