const initialState = {
    projects: [],
    currentProject: null,
    error: null,
};

const projectReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_PROJECTS_SUCCESS":
            return { ...state, projects: action.payload, error: null };
        case "FETCH_PROJECT_SUCCESS":
            return { ...state, currentProject: action.payload, error: null };
        case "CREATE_PROJECT_SUCCESS":
            return { ...state, projects: [...state.projects, action.payload], error: null };
        case "UPDATE_PROJECT_SUCCESS":
            return {
                ...state,
                projects: state.projects.map((project) =>
                    project.projectId === action.payload.projectId ? action.payload : project
                ),
                error: null,
            };
        case "DELETE_PROJECT_SUCCESS":
            return {
                ...state,
                projects: state.projects.filter(
                    (project) => project.projectId !== action.payload
                ),
                error: null,
            };
        case "PROJECT_ERROR":
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

export default projectReducer;
