const initialState = {
    summary: {},
    customers: [],
    projectTypes: [],  // Updated to store project type report data
    error: null,
};

const reportReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_SUMMARY_REPORT_SUCCESS":
            return { ...state, summary: action.payload, error: null };
        case "FETCH_CUSTOMER_REPORT_SUCCESS":
            return { ...state, customers: action.payload, error: null };
        case "FETCH_PROJECT_TYPE_REPORT_SUCCESS":  // Added case for project type report
            return { ...state, projectTypes: action.payload, error: null };
        case "REPORT_ERROR":
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

export default reportReducer;
