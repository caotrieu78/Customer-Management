import { getSummaryReport, getCustomerReport, getProjectTypeReport } from "../../services/ThongKeService";

// Action to fetch summary report
export const fetchSummaryReport = () => async (dispatch) => {
    try {
        const data = await getSummaryReport();
        dispatch({ type: "FETCH_SUMMARY_REPORT_SUCCESS", payload: data });
    } catch (error) {
        dispatch({ type: "REPORT_ERROR", payload: error.message });
    }
};

// Action to fetch customer report
export const fetchCustomerReport = () => async (dispatch) => {
    try {
        const data = await getCustomerReport();
        dispatch({ type: "FETCH_CUSTOMER_REPORT_SUCCESS", payload: data });
    } catch (error) {
        dispatch({ type: "REPORT_ERROR", payload: error.message });
    }
};

// Action to fetch project type report
export const fetchProjectTypeReport = () => async (dispatch) => {
    try {
        const data = await getProjectTypeReport();
        dispatch({ type: "FETCH_PROJECT_TYPE_REPORT_SUCCESS", payload: data });
    } catch (error) {
        dispatch({ type: "REPORT_ERROR", payload: error.message });
    }
};
