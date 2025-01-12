import React, { useState, useEffect } from 'react';
import { getProjectById, updateProject } from '../../services/projectServices';
import { getAllUsers } from '../../services/authService';
import { getAllCustomers } from '../../services/customerServices';
import { getAllProjectTypes } from '../../services/projectServices';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '../../constant/pathnames';

const EditProject = () => {
    const { id } = useParams();  // Get the project ID from URL params
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);

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

                // Fetch project details if editing
                if (id) {
                    const projectResponse = await getProjectById(id);
                    setProjectName(projectResponse.projectName);
                    setDescription(projectResponse.description);
                    setTotalAmount(projectResponse.totalAmount);
                    setCustomerId(projectResponse.customer.customerId);
                    setUserId(projectResponse.user.userId);
                    setProjectTypeId(projectResponse.projectType.projectTypeId);
                    setSelectedCustomer(projectResponse.customer);
                    setSelectedUser(projectResponse.user);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedProject = {
            projectName,
            description,
            status: 'Ongoing',
            totalAmount: parseFloat(totalAmount),
            paidAmount: 0,
            customer: { customerId: parseInt(customerId) },
            user: { userId: parseInt(userId) },
            projectType: { projectTypeId: parseInt(projectTypeId) }
        };

        try {
            const response = await updateProject(id, updatedProject);
            setMessage('Project updated successfully!');
            navigate(PATHS.PROJECT);
        } catch (error) {
            setMessage('Error updating project: ' + error.message);
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

    const toggleUserModal = () => setShowUserModal(!showUserModal);
    const toggleCustomerModal = () => setShowCustomerModal(!showCustomerModal);

    const handleProjectTypeChange = (e) => {
        setProjectTypeId(e.target.value);
    };

    return (
        <div className="container">
            <h1 className="text-center mb-4 ">Chỉnh Sửa Dự Án</h1>
            <form onSubmit={handleSubmit} className="shadow-lg p-4 rounded bg-light">
                <div className="row">
                    {/* Tên Dự Án và Loại Dự Án */}
                    <div className="col-md-6">
                        <div className="form-group mb-4">
                            <label htmlFor="projectName" className="h5">Tên Dự Án</label>
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
                    </div>
                    <div className="col-md-6">
                        <div className="form-group mb-5">
                            <label className="h5">Loại Dự Án</label>
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
                    </div>

                    {/* Mô Tả và Khách Hàng */}
                    <div className="col-md-6">
                        <div className="form-group mb-4">
                            <label htmlFor="description" className="h5">Mô Tả</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form-control form-control-lg"
                                required
                                placeholder="Nhập mô tả dự án"
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group mb-4 mt-4 d-flex justify-content-between align-items-center">
                            <label className="h5">Khách Hàng</label>
                            <button
                                type="button"
                                onClick={toggleCustomerModal}
                                className="btn btn-outline-primary btn-lg btn-block"
                            >
                                <i className="bi bi-person-check-fill"></i> {selectedCustomer ? selectedCustomer.name : 'Chọn Khách Hàng'}
                            </button>
                        </div>
                    </div>

                    {/* Tổng Số Tiền và Người Phụ Trách */}
                    <div className="col-md-6">
                        <div className="form-group mb-4">
                            <label htmlFor="totalAmount" className="h5">Tổng Số Tiền</label>
                            <input
                                id="totalAmount"
                                type="number"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                                className="form-control form-control-lg"
                                required
                                placeholder="Nhập tổng số tiền"
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group mb-4 mt-4 d-flex justify-content-between align-items-center">
                            <label className="h5">Người Phụ Trách</label>
                            <button
                                type="button"
                                onClick={toggleUserModal}
                                className="btn btn-outline-primary btn-lg btn-block"
                            >
                                <i className="bi bi-person-badge"></i> {selectedUser ? selectedUser.username : 'Chọn Người Phụ Trách'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Nút cập nhật */}
                <div className="text-center mt-4">
                    <button type="submit" className="btn btn-primary btn-lg px-5">
                        <i className="bi bi-save"></i> Cập Nhật Dự Án
                    </button>
                </div>

                {/* Hiển thị thông báo */}
                {message && <p className="text-center mt-3 alert alert-info">{message}</p>}

                {/* Popup Modal: Chọn Khách Hàng */}
                {showCustomerModal && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header d-flex justify-content-between align-items-center">
                                    <h5 className="modal-title">Chọn Khách Hàng</h5>
                                    <button type="button" className="close" onClick={toggleCustomerModal}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
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
                                            {customers.map((customer) => (
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

                {/* Popup Modal: Chọn Người Phụ Trách */}
                {showUserModal && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header d-flex justify-content-between align-items-center">
                                    <h5 className="modal-title">Chọn Người Phụ Trách</h5>
                                    <button type="button" className="close" onClick={toggleUserModal}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
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
                                            {users.map((user) => (
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
            </form>



        </div>
    );
};

export default EditProject;
