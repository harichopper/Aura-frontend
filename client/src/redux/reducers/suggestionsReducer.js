import { SUGGES_TYPES } from '../actions/suggestionsAction';

// Initial state
const initialState = {
    loading: false,  // Loading state for API call
    users: []        // List of suggested users
};

// Suggestions Reducer
const suggestionsReducer = (state = initialState, action) => {
    switch (action.type) {
        // Set loading state
        case SUGGES_TYPES.LOADING:
            return {
                ...state,
                loading: action.payload
            };
        
        // Set fetched users
        case SUGGES_TYPES.GET_USERS:
            return {
                ...state,
                users: action.payload.users // Assuming API returns { users: [...] }
            };
        
        // Default case returns previous state
        default:
            return state;
    }
};

export default suggestionsReducer;
