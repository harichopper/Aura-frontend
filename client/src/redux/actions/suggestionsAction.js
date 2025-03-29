import { GLOBALTYPES } from '../actions/globalTypes';
import { getDataAPI } from '../../utils/fetchData';

// Suggestion Types
export const SUGGES_TYPES = {
    LOADING: 'LOADING_SUGGES',  // Loading state
    GET_USERS: 'GET_USERS_SUGGES',  // Fetched users
};

/**
 * Fetch user suggestions from API
 * @param {string} token - Authorization token
 * @returns {Function} Redux Thunk function
 */
export const getSuggestions = (token) => async (dispatch) => {
    try {
        // Start loading
        dispatch({ type: SUGGES_TYPES.LOADING, payload: true });

        // Fetch suggestions from API
        const res = await getDataAPI('suggestionsUser', token);

        // Dispatch fetched users to reducer
        dispatch({ type: SUGGES_TYPES.GET_USERS, payload: res.data });

        // Stop loading
        dispatch({ type: SUGGES_TYPES.LOADING, payload: false });

    } catch (err) {
        // Handle and dispatch error alert
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || 'An error occurred' }
        });
    }
};
