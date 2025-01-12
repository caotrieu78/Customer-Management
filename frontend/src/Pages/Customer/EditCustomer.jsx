import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomerById, updateCustomer } from "../../services/customerServices";
import { PATHS } from "../../constant/pathnames";

function EditCustomer() {
    const { id } = useParams(); // Get customer ID from URL
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        classificationId: "",
        dateOfBirth: "", // Added field for birthdate
    });

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch customer details on component mount
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const customer = await getCustomerById(id);
                setFormData({
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    classificationId: customer.classification?.classificationId || "",
                    dateOfBirth: customer.dateOfBirth || "",
                });
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Unable to load customer information.");
            }
        };

        fetchCustomer();
    }, [id]);

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateCustomer(id, formData);
            setSuccessMessage("Customer information updated successfully!");
            setTimeout(() => navigate(PATHS.CUSTOMER), 2000); // Redirect to customer list after 2 seconds
        } catch (err) {
            console.error("Error updating customer:", err);
            setError("Unable to update customer information.");
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-lg p-4">
                <h1 className="text-center  mb-4">
                    Chỉnh Sửa Thông Tin Khách Hàng
                </h1>

                {/* Success and Error Messages */}
                {successMessage && (
                    <div className="alert alert-success text-center">{successMessage}</div>
                )}
                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        {/* Customer Name */}
                        <div className="col-md-6 mb-3">
                            <label htmlFor="name" className="form-label fw-bold">
                                Tên Khách Hàng
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nhập tên khách hàng"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label fw-bold">
                                Email
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Nhập email"
                            />
                        </div>
                    </div>

                    <div className="row">
                        {/* Phone */}
                        <div className="col-md-6 mb-3">
                            <label htmlFor="phone" className="form-label fw-bold">
                                Số Điện Thoại
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        {/* Address */}
                        <div className="col-md-6 mb-3">
                            <label htmlFor="address" className="form-label fw-bold">
                                Địa Chỉ
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ"
                            />
                        </div>
                    </div>

                    <div className="row">
                        {/* Classification */}
                        <div className="col-md-6 mb-3">
                            <label htmlFor="classificationId" className="form-label fw-bold">
                                Phân Loại
                            </label>
                            <select
                                className="form-select"
                                id="classificationId"
                                name="classificationId"
                                value={formData.classificationId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn phân loại</option>
                                <option value="1">VIP</option>
                                <option value="2">Normal</option>
                                <option value="3">Potential</option>
                            </select>
                        </div>

                        {/* Date of Birth */}
                        <div className="col-md-6 mb-3">
                            <label htmlFor="dateOfBirth" className="form-label fw-bold">
                                Ngày Sinh
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center mt-4">
                        <button type="submit" className="btn btn-primary btn-lg px-5">
                            Cập Nhật Thông Tin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditCustomer;
