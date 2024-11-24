// Initial State
const initialState = {
    payments: [],
    currentPayment: null,
    error: null,
};

// Reducer
const paymentReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_PAYMENTS_SUCCESS":
            return { ...state, payments: action.payload, error: null };
        case "FETCH_PAYMENT_SUCCESS":
            return { ...state, currentPayment: action.payload, error: null };
        case "CREATE_PAYMENT_SUCCESS":
            return { ...state, payments: [...state.payments, action.payload], error: null };
        case "UPDATE_PAYMENT_SUCCESS":
            return {
                ...state,
                payments: state.payments.map((payment) =>
                    payment.paymentId === action.payload.paymentId ? action.payload : payment
                ),
                error: null,
            };
        case "DELETE_PAYMENT_SUCCESS":
            return {
                ...state,
                payments: state.payments.filter((payment) => payment.paymentId !== action.payload),
                error: null,
            };
        case "PAYMENT_ERROR":
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

export default paymentReducer;
