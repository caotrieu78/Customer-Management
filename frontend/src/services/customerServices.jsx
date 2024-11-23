import axios from "axios";
import environments from "../constant/environment";

const API_BASE_URL = environments.apiBaseUrl;

export const getAllCustomers = async () => {
    const response = await axios.get(`${API_BASE_URL}/customers`);
    return response.data;
};

export const getCustomerById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/customers/${id}`);
    return response.data;
};

export const createCustomer = async (customer) => {
    const response = await axios.post(`${API_BASE_URL}/customers`, customer);
    return response.data;
};

export const updateCustomer = async (id, customer) => {
    const response = await axios.put(`${API_BASE_URL}/customers/${id}`, customer);
    return response.data;
};

export const deleteCustomer = async (id) => {
    await axios.delete(`${API_BASE_URL}/customers/${id}`);
};
