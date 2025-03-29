import { MESS_TYPES } from '../actions/messageAction';
import { EditData, DeleteData } from '../actions/globalTypes';

// Initial State
const initialState = {
    users: [],        // All conversation partners
    resultUsers: 0,   // Count of users/conversations
    data: [],         // Messages grouped by conversation (id, messages array, result count, page)
    firstLoad: false  // To check if initial conversation load happened
};

// Message Reducer
const messageReducer = (state = initialState, action) => {
    switch (action.type) {

        // ================================
        // Add User to Conversation List
        // ================================
        case MESS_TYPES.ADD_USER:
            if (state.users.every(item => item._id !== action.payload._id)) {
                return {
                    ...state,
                    users: [action.payload, ...state.users] // Add if not already present
                };
            }
            return state;

        // ================================
        // Add Message to the Correct Conversation
        // ================================
        case MESS_TYPES.ADD_MESSAGE:
            return {
                ...state,
                // Add message to existing conversation data
                data: state.data.map(item =>
                    item._id === action.payload.recipient || item._id === action.payload.sender
                        ? {
                            ...item,
                            messages: [...item.messages, action.payload], // Append new message
                            result: item.result + 1
                        }
                        : item
                ),
                // Update latest message (text/media/call) in users list (sidebar preview)
                users: state.users.map(user =>
                    user._id === action.payload.recipient || user._id === action.payload.sender
                        ? {
                            ...user,
                            text: action.payload.text,
                            media: action.payload.media,
                            call: action.payload.call
                        }
                        : user
                )
            };

        // ================================
        // Load Conversations (Initial or Paginated)
        // ================================
        case MESS_TYPES.GET_CONVERSATIONS:
            return {
                ...state,
                users: action.payload.newArr,
                resultUsers: action.payload.result,
                firstLoad: true
            };

        // ================================
        // Get Messages for a Specific Conversation
        // ================================
        case MESS_TYPES.GET_MESSAGES:
            return {
                ...state,
                data: [...state.data, action.payload] // Add new conversation's message data
            };

        // ================================
        // Load More Messages (Pagination)
        // ================================
        case MESS_TYPES.UPDATE_MESSAGES:
            return {
                ...state,
                data: EditData(state.data, action.payload._id, action.payload) // Update existing conversation with more messages
            };

        // ================================
        // Delete Specific Message from Conversation
        // ================================
        case MESS_TYPES.DELETE_MESSAGES:
            return {
                ...state,
                data: state.data.map(item =>
                    item._id === action.payload._id
                        ? { ...item, messages: action.payload.newData } // Remove message from messages array
                        : item
                )
            };

        // ================================
        // Delete Entire Conversation
        // ================================
        case MESS_TYPES.DELETE_CONVERSATION:
            return {
                ...state,
                users: DeleteData(state.users, action.payload), // Remove from user list
                data: DeleteData(state.data, action.payload)    // Remove message data
            };

        // ================================
        // Check Online/Offline Status for Users
        // ================================
        case MESS_TYPES.CHECK_ONLINE_OFFLINE:
            return {
                ...state,
                users: state.users.map(user =>
                    action.payload.includes(user._id)
                        ? { ...user, online: true }
                        : { ...user, online: false }
                )
            };

        // ================================
        // Default
        // ================================
        default:
            return state;
    }
};

export default messageReducer;
