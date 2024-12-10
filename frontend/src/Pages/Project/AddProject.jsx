import React, { useState, useEffect } from 'react';
import { createProject } from '../../services/projectServices';
import { getAllUsers } from '../../services/authService';
import { getAllCustomers } from '../../services/customerServices';
import { getAllProjectTypes } from '../../services/projectServices';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../constant/pathnames';

const AddProject = () => {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [userId, setUserId] = useState('');
    const [projectTypeId, setProjectTypeId] = useState('');
    const [message, setMessage] = useState('');
    const [customers, setCustomers] = useState([]);
    const [users, setUsers] = useState([]);
    const [projectTypes, setProjectTypes] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchCustomer, setSearchCustomer] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const customersResponse = await getAllCustomers();
                setCustomers(customersResponse);

                const usersResponse = await getAllUsers();
                setUsers(usersResponse.filter(user => user.role !== 'admin'));

                const projectTypesResponse = await getAllProjectTypes();
                setProjectTypes(projectTypesResponse);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (value) => {
        // Chuyển đổi thành số
        let num = value.replace(/\./g, '').replace(',', '.');
        if (isNaN(num)) return value;

        // Format số tiền theo dấu chấm ngăn cách hàng nghìn
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        customer.phone.includes(searchCustomer)
    );

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.role.toLowerCase().includes(searchUser.toLowerCase())
    );
    const handleTotalAmountChange = (e) => {
        const formattedValue = formatCurrency(e.target.value);
        setTotalAmount(formattedValue);  // Cập nhật giá trị vào state
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newProject = {
            projectName,
            description,
            status: 'Ongoing',
            totalAmount: parseFloat(totalAmount.replace(/\./g, '')),  // Chuyển về số sau khi format
            paidAmount: 0,
            customer: { customerId: parseInt(customerId) },
            user: { userId: parseInt(userId) },
            projectType: { projectTypeId: parseInt(projectTypeId) }
        };

        try {
            const response = await createProject(newProject);
            setMessage('Project created successfully!');
            navigate(PATHS.PROJECT);  // Navigate to the project list page
        } catch (error) {
            setMessage('Error creating project: ' + error.message);
        }
    };

    const handleUserSelect = (user) => {
        setUserId(user.userId);
        setSelectedUser(user);
        setShowUserModal(false);
    };

    const handleCustomerSelect = (customer) => {
        setCustomerId(customer.customerId);
        setSelectedCustomer(customer);
        setShowCustomerModal(false);
    };

    const toggleUserModal = () => {
        setShowUserModal(!showUserModal);
    };

    const toggleCustomerModal = () => {
        setShowCustomerModal(!showCustomerModal);
    };

    const handleProjectTypeChange = (e) => {
        setProjectTypeId(e.target.value);
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4 display-4">Tạo Dự Án Mới</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-4">
                    <label htmlFor="projectName" className="h4">Tên Dự Án</label>
                    <input
                        id="projectName"
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="form-control form-control-lg"
                        required
                        placeholder="Nhập tên dự án"
                    />
                </div>

                <div className="form-group mb-4">
                    <label htmlFor="description" className="h4">Mô Tả</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-control form-control-lg"
                        required
                        placeholder="Nhập mô tả dự án"
                    />
                </div>

                <div className="form-group mb-4">
                    <label htmlFor="totalAmount" className="h4">Tổng Số Tiền</label>
                    <input
                        id="totalAmount"
                        type="text"
                        value={totalAmount}
                        onChange={handleTotalAmountChange}
                        className="form-control form-control-lg"
                        required
                        placeholder="Nhập tổng số tiền"
                    />
                </div>

                {/* Customer Button */}
                <div className="form-group mb-4">
                    <label className="h4 ">Khách Hàng</label>
                    <button type="button" onClick={toggleCustomerModal} className="btn btn-outline-primary btn-lg btn-block ms-4">
                        {selectedCustomer ? `${selectedCustomer.name}` : 'Chọn Khách Hàng'}
                    </button>
                </div>

                {/* Modal for selecting customer */}
                {showCustomerModal && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Chọn Khách Hàng</h5>
                                    <button type="button" className="close" onClick={toggleCustomerModal}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        placeholder="Tìm kiếm khách hàng"
                                        value={searchCustomer}
                                        onChange={(e) => setSearchCustomer(e.target.value)}
                                    />
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Tên</th>
                                                <th>Email</th>
                                                <th>Số điện thoại</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCustomers.map((customer) => (
                                                <tr key={customer.customerId}>
                                                    <td>{customer.name}</td>
                                                    <td>{customer.email}</td>
                                                    <td>{customer.phone}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={() => handleCustomerSelect(customer)}
                                                        >
                                                            Chọn
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={toggleCustomerModal}>
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Button */}
                <div className="form-group mb-4 mt-4">
                    <label className="h4">Người Phụ Trách</label>
                    <button type="button" onClick={toggleUserModal} className="btn btn-outline-primary btn-lg btn-block ms-4">
                        {selectedUser ? `${selectedUser.username}` : 'Chọn Người Phụ Trách'}
                    </button>
                </div>

                {/* Modal for selecting user */}
                {showUserModal && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Chọn Người Phụ Trách</h5>
                                    <button type="button" className="close" onClick={toggleUserModal}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        placeholder="Tìm kiếm người phụ trách"
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                    />
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Tên người dùng</th>
                                                <th>Họ tên</th>
                                                <th>Vai trò</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr key={user.userId}>
                                                    <td>{user.username}</td>
                                                    <td>{user.fullName}</td>
                                                    <td>{user.role}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={() => handleUserSelect(user)}
                                                        >
                                                            Chọn
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={toggleUserModal}>
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-group mb-4">
                    <label className="h4">Loại Dự Án</label>
                    <select
                        value={projectTypeId}
                        onChange={handleProjectTypeChange}
                        className="form-control form-control-lg"
                        required
                    >
                        <option value="">Chọn Loại Dự Án</option>
                        {projectTypes.map((projectType) => (
                            <option key={projectType.projectTypeId} value={projectType.projectTypeId}>
                                {projectType.typeName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group mb-4">
                    <button type="submit" className="btn btn-primary btn-lg btn-block">Tạo Dự Án</button>
                </div>
            </form>

            {message && <p className="text-center mt-3">{message}</p>}
        </div>
    );
};

export default AddProject;
