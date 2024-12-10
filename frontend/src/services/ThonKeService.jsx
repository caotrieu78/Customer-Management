import axios from "axios";
import environments from "../constant/environment";

const API_BASE_URL = environments.apiBaseUrl;

// Fetch Summary Report
export const getSummaryReport = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reports/summary`);
        return response.data; // Ensure the response contains summary report data
    } catch (error) {
        console.error("Error fetching summary report:", error);
        throw new Error("Unable to fetch summary report.");
    }
};

// Fetch Customer Report
export const getCustomerReport = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reports/customer`);
        return response.data; // Ensure the response contains customer report data
    } catch (error) {
        console.error("Error fetching customer report:", error);
        throw new Error("Unable to fetch customer report.");
    }
};

// Fetch Project Type Report
export const getProjectReport = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reports/project-type`);  // Updated endpoint
        return response.data; // Ensure the response contains project type report data
    } catch (error) {
        console.error("Error fetching project type report:", error);
        throw new Error("Unable to fetch project type report.");
    }
};
