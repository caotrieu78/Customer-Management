const USER_PATH = "/user";
const CUSTOMER_PATH = "/customer";
const PROJECT_PATH = "/project";
const EVENT_PATH = "/event";
const REMAIND_PATH = "/remainder";
const PAYMENT_PATH = "/payment";

export const PATHS = {
    // Authentication
    LOGIN: "/login",
    HOME: "/",

    // User Management
    USER: USER_PATH,
    ADD_USER: `${USER_PATH}/addUser`,
    EDIT_USER: `${USER_PATH}/editUser`,

    // Customer Management
    CUSTOMER: CUSTOMER_PATH,
    ADD_CUSTOMER: `${USER_PATH}/addCustomer`,
    EDIT_CUSTOMER: `${USER_PATH}/editCustomer`,


    // Project Management
    PROJECT: PROJECT_PATH,

    // Event Management
    EVENT: EVENT_PATH,

    // Reminder Management
    REMAIND: REMAIND_PATH,

    // Payment Management
    PAYMENT: PAYMENT_PATH,
};
