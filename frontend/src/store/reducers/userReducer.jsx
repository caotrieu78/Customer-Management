const initialState = {
    users: [],
    currentUser: null,
    error: null,
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_USERS_SUCCESS":
            return { ...state, users: action.payload };
        case "FETCH_USER_SUCCESS":
            return { ...state, currentUser: action.payload };
        case "CREATE_USER_SUCCESS":
            return { ...state, users: [...state.users, action.payload] };
        case "UPDATE_USER_SUCCESS":
            return {
                ...state,
                users: state.users.map((user) =>
                    user.id === action.payload.id ? action.payload : user
                ),
            };
        case "DELETE_USER_SUCCESS":
            return {
                ...state,
                users: state.users.filter((user) => user.id !== action.payload),
            };
        case "USER_ERROR":
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

export default userReducer;
