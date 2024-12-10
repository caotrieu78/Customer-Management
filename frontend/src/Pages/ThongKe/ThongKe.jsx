import React, { useEffect, useState } from "react";
import { getSummaryReport, getCustomerReport, getProjectReport } from "../../services/ThonKeService";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import * as XLSX from "xlsx";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ThongKe = () => {
    const [summary, setSummary] = useState({ revenueByMonth: [], revenueByYear: [], revenueByProjectType: [] });
    const [customers, setCustomers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("summary");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const summaryData = await getSummaryReport();
                const customerData = await getCustomerReport();
                const projectData = await getProjectReport();

                setSummary(summaryData);

                // Sort customers by totalPaid in descending order
                const sortedCustomers = customerData.sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0));
                setCustomers(sortedCustomers);

                setProjects(projectData);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchReports();
    }, []);

    // Chart data and options
    const chartData = {
        labels: ["Tổng doanh thu tháng 11", "Tổng doanh thu tháng 12", "Tổng doanh thu tháng 1", "Tổng doanh thu tháng 2", "Tổng doanh thu tháng 3"],
        datasets: [
            {
                label: "Doanh thu theo tháng",
                data: summary.revenueByMonth.map(item => item.totalRevenue),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Biểu đồ doanh thu theo tháng"
            },
            tooltip: {
                mode: "index",
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    // Export to Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Summary Data
        const summarySheet = XLSX.utils.json_to_sheet(summary.revenueByMonth.map(item => ({
            Tháng: `Tháng ${item.month}/${item.year}`,
            DoanhThu: item.totalRevenue.toLocaleString()
        })));
        XLSX.utils.book_append_sheet(wb, summarySheet, "Doanh thu theo tháng");

        // Customer Data
        const customerSheet = XLSX.utils.json_to_sheet(customers.map(customer => ({
            TênKhachHang: customer.customerName,
            Email: customer.customerEmail,
            TongTienThanhToan: customer.totalPaid ? customer.totalPaid.toLocaleString() : "Chưa có",
            SoDuAnThamGia: customer.projectCount
        })));
        XLSX.utils.book_append_sheet(wb, customerSheet, "Khách hàng");

        // Project Data
        const projectSheet = XLSX.utils.json_to_sheet(projects.map(project => ({
            LoaiDuAn: project.typeName,
            TongDoanhThu: project.totalRevenue.toLocaleString()
        })));
        XLSX.utils.book_append_sheet(wb, projectSheet, "Dự án");

        // Write the Excel file
        XLSX.writeFile(wb, "ThongKe_BaoCao.xlsx");
    };

    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">Thống Kê Báo Cáo</h1>

            {/* Error Handling */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Tab Navigation */}
            <ul className="nav nav-tabs" id="reportTabs" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "summary" ? "active" : ""}`}
                        onClick={() => setActiveTab("summary")}
                    >
                        Báo Cáo Tổng Quan
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "customers" ? "active" : ""}`}
                        onClick={() => setActiveTab("customers")}
                    >
                        Báo Cáo Khách Hàng
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "projects" ? "active" : ""}`}
                        onClick={() => setActiveTab("projects")}
                    >
                        Báo Cáo Dự Án
                    </button>
                </li>
            </ul>

            {/* Export Button */}
            <div className="mt-4 text-center">
                <button className="btn btn-success" onClick={exportToExcel}>
                    Xuất Báo Cáo Excel
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content mt-4">
                {/* Summary Report */}
                {activeTab === "summary" && (
                    <div className="tab-pane fade show active">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5>Báo Cáo Tổng Quan</h5>
                            </div>
                            <div className="card-body">
                                <p><strong>Doanh thu theo tháng:</strong></p>
                                {summary.revenueByMonth.map((item, index) => (
                                    <p key={index}>
                                        Tháng {item.month}/{item.year}: {item.totalRevenue.toLocaleString()} VND
                                    </p>
                                ))}
                            </div>
                        </div>
                        {/* Bar Chart */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5>Báo Cáo Biểu Đồ Cột</h5>
                            </div>
                            <div className="card-body">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Customer Report */}
                {activeTab === "customers" && (
                    <div className="tab-pane fade show active">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5>Báo Cáo Khách Hàng</h5>
                            </div>
                            <div className="card-body">
                                {customers.length === 0 ? (
                                    <p className="text-muted">Không có dữ liệu khách hàng</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Tên Khách Hàng</th>
                                                    <th>Email</th>
                                                    <th>Tổng Tiền Thanh Toán</th>
                                                    <th>Số Dự Án Tham Gia</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customers.map((customer, index) => (
                                                    <tr key={index}>
                                                        <td>{customer.customerName}</td>
                                                        <td>{customer.customerEmail}</td>
                                                        <td>{customer.totalPaid ? customer.totalPaid.toLocaleString() : "Chưa có"}</td>
                                                        <td>{customer.projectCount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Report */}
                {activeTab === "projects" && (
                    <div className="tab-pane fade show active">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5>Báo Cáo Dự Án</h5>
                            </div>
                            <div className="card-body">
                                {projects.length === 0 ? (
                                    <p className="text-muted">Không có dữ liệu dự án</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Loại Dự Án</th>
                                                    <th>Tổng Doanh Thu</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {projects.map((project, index) => (
                                                    <tr key={index}>
                                                        <td>{project.typeName}</td>
                                                        <td>{project.totalRevenue.toLocaleString()} VND</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThongKe;
