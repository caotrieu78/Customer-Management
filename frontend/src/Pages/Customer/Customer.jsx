import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { PATHS } from "../../constant/pathnames";
import { getAllCustomers, deleteCustomer } from "../../services/customerServices";

function Customer() {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [classificationFilter, setClassificationFilter] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [customerToDelete, setCustomerToDelete] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const customersPerPage = 10; // Number of customers per page

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

    // Apply search and classification filter
    useEffect(() => {
        let tempCustomers = [...customers];

        // Filter by classification if selected
        if (classificationFilter) {
            tempCustomers = tempCustomers.filter(
                (customer) =>
                    customer.classification?.classificationName === classificationFilter
            );
        }

        // Filter by search term
        if (searchTerm) {
            tempCustomers = tempCustomers.filter(
                (customer) =>
                    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCustomers(tempCustomers);
        setCurrentPage(1); // Reset to the first page after filtering
    }, [searchTerm, classificationFilter, customers]);

    // Handle delete customer
    const confirmDelete = (customerId) => {
        setCustomerToDelete(customerId);
    };

    const handleDelete = async () => {
        try {
            await deleteCustomer(customerToDelete);
            setCustomers(customers.filter((customer) => customer.customerId !== customerToDelete));
            setSuccessMessage("Customer deleted successfully!");
            setCustomerToDelete(null);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error("Error deleting customer:", err);
            setError("Unable to delete customer.");
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

    // Get user role from localStorage (e.g., "Admin", "Staff")
    const user = JSON.parse(localStorage.getItem("user"));
    const userRole = user?.role; // Assuming the user object contains the role

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (customers.length === 0) {
        return <div className="alert alert-warning">Không có khách hàng nào được tìm thấy.</div>;
    }

    return (
        <div className="container">
            {/* Success Message */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            {/* Add Customer Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Danh sách khách hàng</h1>
                <NavLink to={PATHS.ADD_CUSTOMER} className="btn btn-primary">
                    Thêm khách hàng
                </NavLink>
            </div>

            {/* Search and Filter */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                {/* Search */}
                <input
                    type="text"
                    className="form-control w-50 me-3"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Filter */}
                <select
                    className="form-select w-25"
                    value={classificationFilter}
                    onChange={(e) => setClassificationFilter(e.target.value)}
                >
                    <option value="">Tất cả phân loại</option>
                    <option value="VIP">VIP</option>
                    <option value="Normal">Normal</option>
                    <option value="Potential">Potential</option>
                </select>
            </div>

            {/* Customer Table */}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Phân loại</th>
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
                                <td>{customer.classification?.classificationName}</td>
                                <td>
                                    <NavLink
                                        to={`${PATHS.EDIT_CUSTOMER}/${customer.customerId}`}
                                        className="btn btn-warning btn-sm me-2"
                                    >
                                        Sửa
                                    </NavLink>
                                    {/* Only render Delete button if user role is "Admin" */}
                                    {userRole === "Admin" && (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => confirmDelete(customer.customerId)}
                                        >
                                            Xóa
                                        </button>
                                    )}
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
