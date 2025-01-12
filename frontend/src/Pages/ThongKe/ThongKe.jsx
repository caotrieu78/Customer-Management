import React, { useEffect, useState } from "react";
import {
    getSummaryReport,
    getCustomerReport,
    getProjectReport
} from "../../services/ThonKeService";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import * as XLSX from "xlsx";

// Register chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ThongKe = () => {
    const [summary, setSummary] = useState({
        revenueByMonth: [],
        revenueByYear: [],
        revenueByProjectType: []
    });
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
                const sortedCustomers = customerData.sort(
                    (a, b) => (b.totalPaid || 0) - (a.totalPaid || 0)
                );
                setCustomers(sortedCustomers);

                setProjects(projectData);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchReports();
    }, []);

    // Chart data and options for revenue by month
    const chartDataSummary = {
        labels: summary.revenueByMonth.map(
            (item) => `Tháng ${item.month}/${item.year}`
        ),
        datasets: [
            {
                label: "Doanh thu theo tháng",
                data: summary.revenueByMonth.map((item) => item.totalRevenue),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }
        ]
    };

    const chartOptionsSummary = {
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

    // Chart data for customer report
    const chartDataCustomers = {
        labels: customers.map((customer) => customer.customerName),
        datasets: [
            {
                label: "Tổng Tiền Thanh Toán",
                data: customers.map((customer) => customer.totalPaid || 0),
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }
        ]
    };

    const chartOptionsCustomers = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Biểu đồ khách hàng theo tổng tiền thanh toán"
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    // Chart data for project report
    const chartDataProjects = {
        labels: projects.map((project) => project.typeName),
        datasets: [
            {
                label: "Tổng Doanh Thu",
                data: projects.map((project) => project.totalRevenue),
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1
            }
        ]
    };

    const chartOptionsProjects = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Biểu đồ dự án theo tổng doanh thu"
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    // Export to Excel
    // Function to export data to Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // 1. Sheet: Doanh thu theo tháng
        const summarySheet = XLSX.utils.json_to_sheet(
            summary.revenueByMonth.map((item, index) => ({
                STT: index + 1,
                "Tháng/Năm": `Tháng ${item.month}/${item.year}`,
                "Tổng Doanh Thu (VND)": item.totalRevenue.toLocaleString()
            }))
        );
        XLSX.utils.book_append_sheet(wb, summarySheet, "Doanh thu theo tháng");

        // 2. Sheet: Chi tiết khách hàng
        const customerSheet = XLSX.utils.json_to_sheet(
            customers.map((customer, index) => ({
                STT: index + 1,
                "Tên Khách Hàng": customer.customerName,
                Email: customer.customerEmail,
                "Tổng Tiền Thanh Toán (VND)": customer.totalPaid
                    ? customer.totalPaid.toLocaleString()
                    : "Chưa thanh toán",
                "Số Dự Án Tham Gia": customer.projectCount
            }))
        );
        XLSX.utils.book_append_sheet(wb, customerSheet, "Khách hàng");

        // 3. Sheet: Chi tiết dự án
        const projectSheet = XLSX.utils.json_to_sheet(
            projects.map((project, index) => ({
                STT: index + 1,
                "Tên Loại Dự Án": project.typeName,
                "Tổng Doanh Thu (VND)": project.totalRevenue.toLocaleString()
            }))
        );
        XLSX.utils.book_append_sheet(wb, projectSheet, "Dự án");

        // Xuất file Excel
        XLSX.writeFile(wb, "BaoCaoThongKe.xlsx");
    };

    return (
        <div className="container my-5">
            <h1 className="text-primary text-center mb-4">
                <i class="bi bi-graph-up-arrow"></i>Thống Kê Báo Cáo
            </h1>

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
                        <Bar data={chartDataSummary} options={chartOptionsSummary} />
                    </div>
                )}
                {/* Customer Report */}
                {activeTab === "customers" && (
                    <div className="tab-pane fade show active">
                        <Bar data={chartDataCustomers} options={chartOptionsCustomers} />
                    </div>
                )}

                {/* Project Report */}
                {activeTab === "projects" && (
                    <div className="tab-pane fade show active">
                        <Bar data={chartDataProjects} options={chartOptionsProjects} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThongKe;
