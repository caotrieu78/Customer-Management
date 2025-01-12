import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { PATHS } from "../../constant/pathnames";
import { getAllCustomers, deleteCustomer } from "../../services/customerServices";

function Customer() {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [classificationFilter, setClassificationFilter] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [customerToDelete, setCustomerToDelete] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const customersPerPage = 10; // Number of customers per page

    // Sort states
    const [sortColumn, setSortColumn] = useState(""); // Currently sorted column
    const [sortOrder, setSortOrder] = useState("asc"); // Ascending or descending

    // Search by column
    const [columnSearch, setColumnSearch] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    // Toggle search visibility
    const [visibleSearch, setVisibleSearch] = useState({
        name: false,
        email: false,
        phone: false,
        address: false,
    });

    // Fetch all customers
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getAllCustomers();
                setCustomers(data);
                setFilteredCustomers(data); // Initialize filteredCustomers
            } catch (err) {
                console.error("Error fetching customers:", err);
                setError("Unable to fetch customers.");
            }
        };

        fetchCustomers();
    }, []);

    // Apply search, classification filter, and sorting
    useEffect(() => {
        let tempCustomers = [...customers];

        // Filter by classification
        if (classificationFilter) {
            tempCustomers = tempCustomers.filter(
                (customer) =>
                    customer.classification?.classificationName === classificationFilter
            );
        }

        // Filter by column search
        tempCustomers = tempCustomers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(columnSearch.name.toLowerCase()) &&
                customer.email.toLowerCase().includes(columnSearch.email.toLowerCase()) &&
                customer.phone.toLowerCase().includes(columnSearch.phone.toLowerCase()) &&
                customer.address.toLowerCase().includes(columnSearch.address.toLowerCase())
        );

        // Sort customers
        if (sortColumn) {
            tempCustomers.sort((a, b) => {
                const aValue =
                    sortColumn === "classificationName"
                        ? a.classification?.classificationName || ""
                        : a[sortColumn] || "";
                const bValue =
                    sortColumn === "classificationName"
                        ? b.classification?.classificationName || ""
                        : b[sortColumn] || "";
                if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
                if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
        }

        setFilteredCustomers(tempCustomers);
        setCurrentPage(1); // Reset to the first page after filtering/sorting
    }, [classificationFilter, columnSearch, customers, sortColumn, sortOrder]);

    // Handle delete customer
    const confirmDelete = (customerId) => {
        setCustomerToDelete(customerId);
    };

    const handleDelete = async () => {
        try {
            await deleteCustomer(customerToDelete);
            setCustomers(
                customers.filter((customer) => customer.customerId !== customerToDelete)
            );
            setSuccessMessage("Customer deleted successfully!");
            setCustomerToDelete(null);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error("Error deleting customer:", err);
            setError("Unable to delete customer.");
        }
    };

    // Handle sort
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    // Pagination logic
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(
        indexOfFirstCustomer,
        indexOfLastCustomer
    );

    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    // Toggle search visibility for each column
    const toggleSearch = (column) => {
        setVisibleSearch((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (customers.length === 0) {
        return (
            <div className="alert alert-warning">
                Không có khách hàng nào được tìm thấy.
            </div>
        );
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
                Danh sách Khách Hàng
            </h1>
            {/* Add Customer Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">


                <NavLink to={PATHS.ADD_CUSTOMER} className="btn btn-primary">
                    <i class="bi bi-person-plus"></i> Thêm khách hàng
                </NavLink>
            </div>
            {/* Customer Table */}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Tên
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("name")}
                                    ></i>
                                </div>
                                {visibleSearch.name && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm Tên"
                                        value={columnSearch.name}
                                        onChange={(e) =>
                                            setColumnSearch({
                                                ...columnSearch,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                )}
                            </th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Email
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("email")}
                                    ></i>
                                </div>
                                {visibleSearch.email && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm Email"
                                        value={columnSearch.email}
                                        onChange={(e) =>
                                            setColumnSearch({
                                                ...columnSearch,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                )}
                            </th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Điện thoại
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("phone")}
                                    ></i>
                                </div>
                                {visibleSearch.phone && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm Điện thoại"
                                        value={columnSearch.phone}
                                        onChange={(e) =>
                                            setColumnSearch({
                                                ...columnSearch,
                                                phone: e.target.value,
                                            })
                                        }
                                    />
                                )}
                            </th>
                            <th>
                                <div className="d-flex justify-content-between align-items-center">
                                    Địa chỉ
                                    <i
                                        className="bi bi-search"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleSearch("address")}
                                    ></i>
                                </div>
                                {visibleSearch.address && (
                                    <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Tìm kiếm Địa chỉ"
                                        value={columnSearch.address}
                                        onChange={(e) =>
                                            setColumnSearch({
                                                ...columnSearch,
                                                address: e.target.value,
                                            })
                                        }
                                    />
                                )}
                            </th>
                            <th onClick={() => handleSort("classificationName")}>
                                <div className="d-flex justify-content-between align-items-center">
                                    Phân loại
                                    {sortColumn === "classificationName" && (
                                        <span>{sortOrder === "asc" ? " ↑" : " ↓"}</span>
                                    )}
                                </div>
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentCustomers.map((customer) => (
                            <tr key={customer.customerId}>
                                <td>{customer.customerId}</td>
                                <td>{customer.name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td>{customer.address}</td>
                                <td>{customer.classification?.classificationName || "N/A"}</td>
                                <td>
                                    <NavLink
                                        to={`${PATHS.EDIT_CUSTOMER}/${customer.customerId}`}
                                        className="btn btn-warning btn-sm me-2"
                                    >
                                        <i class="bi bi-pencil-square"></i> Sửa
                                    </NavLink>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => confirmDelete(customer.customerId)}
                                    >
                                        <i class="bi bi-trash3"></i> Xóa
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
            {customerToDelete && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Xác nhận xóa</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setCustomerToDelete(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Bạn có chắc chắn muốn xóa khách hàng này?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setCustomerToDelete(null)}
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
        </div>
    );
}

export default Customer;
