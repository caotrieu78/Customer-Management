import { combineReducers } from "redux";
import userReducer from "./reducers/userReducer";
import customerReducer from "./reducers/customerReducer";
import projectReducer from "./reducers/projectReducer";
import paymentReducer from "./reducers/paymentReducer";

export default combineReducers({
    user: userReducer,
    customer: customerReducer,
    project: projectReducer,
    payment: paymentReducer,
});
