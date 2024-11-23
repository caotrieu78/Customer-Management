import { combineReducers } from "redux";
import userReducer from "./reducers/userReducer";
import customerReducer from "./reducers/customerReducer";

export default combineReducers({
    user: userReducer,
    customer: customerReducer,
});
