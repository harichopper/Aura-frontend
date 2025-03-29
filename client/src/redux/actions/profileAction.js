import { GLOBALTYPES, DeleteData } from './globalTypes';
import { getDataAPI, patchDataAPI } from '../../utils/fetchData';
import { imageUpload } from '../../utils/imageUpload';
import { createNotify, removeNotify } from '../actions/notifyAction';

export const PROFILE_TYPES = {
    LOADING: 'LOADING_PROFILE',
    GET_USER: 'GET_PROFILE_USER',
    FOLLOW: 'FOLLOW',
    UNFOLLOW: 'UNFOLLOW',
    GET_ID: 'GET_PROFILE_ID',
    GET_POSTS: 'GET_PROFILE_POSTS',
    UPDATE_POST: 'UPDATE_PROFILE_POST'
};

// 📌 Fetch user profile & posts
export const getProfileUsers = ({ id, auth }) => async (dispatch) => {
    dispatch({ type: PROFILE_TYPES.GET_ID, payload: id });

    try {
        dispatch({ type: PROFILE_TYPES.LOADING, payload: true });

        const [userRes, postsRes] = await Promise.all([
            getDataAPI(`/user/${id}`, auth.token),
            getDataAPI(`/user_posts/${id}`, auth.token)
        ]);

        dispatch({
            type: PROFILE_TYPES.GET_USER,
            payload: userRes.data
        });

        dispatch({
            type: PROFILE_TYPES.GET_POSTS,
            payload: { ...postsRes.data, _id: id, page: 2 }
        });

        dispatch({ type: PROFILE_TYPES.LOADING, payload: false });
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || "Failed to fetch profile data." }
        });
    }
};

// 📌 Update user profile
export const updateProfileUser = ({ userData, avatar, auth }) => async (dispatch) => {
    if (!userData.fullname)
        return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Please add your full name." } });

    if (userData.fullname.length > 25)
        return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Your full name is too long." } });

    if (userData.story.length > 200)
        return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Your story is too long." } });

    try {
        let media = [];
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

        if (avatar) {
            media = await imageUpload([avatar]);

            if (!media[0]?.url) {
                return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Image upload failed!" } });
            }
        }

        const res = await patchDataAPI(
            "user",
            { ...userData, avatar: avatar ? media[0].url : auth.user.avatar },
            auth.token
        );

        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: {
                ...auth,
                user: { ...auth.user, ...userData, avatar: avatar ? media[0].url : auth.user.avatar }
            }
        });

        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
    } catch (err) {
        console.error("Profile update error:", err);
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err?.response?.data?.msg || "Something went wrong!" }
        });
    }
};

// 📌 Follow user
export const follow = ({ users, user, auth, socket }) => async (dispatch) => {
    let newUser = users.some(item => item._id === user._id)
        ? users.map(item => item._id === user._id ? { ...item, followers: [...item.followers, auth.user] } : item)
        : { ...user, followers: [...user.followers, auth.user] };

    dispatch({ type: PROFILE_TYPES.FOLLOW, payload: newUser });

    dispatch({
        type: GLOBALTYPES.AUTH,
        payload: {
            ...auth,
            user: { ...auth.user, following: [...auth.user.following, newUser] }
        }
    });

    try {
        const res = await patchDataAPI(`user/${user._id}/follow`, null, auth.token);
        socket.emit('follow', res.data.newUser);

        // Notify
        const msg = {
            id: auth.user._id,
            text: 'has started following you.',
            recipients: [newUser._id],
            url: `/profile/${auth.user._id}`,
        };
        dispatch(createNotify({ msg, auth, socket }));
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || "Failed to follow user." }
        });
    }
};

// 📌 Unfollow user
export const unfollow = ({ users, user, auth, socket }) => async (dispatch) => {
    let newUser = users.some(item => item._id === user._id)
        ? users.map(item => item._id === user._id ? { ...item, followers: DeleteData(item.followers, auth.user._id) } : item)
        : { ...user, followers: DeleteData(user.followers, auth.user._id) };

    dispatch({ type: PROFILE_TYPES.UNFOLLOW, payload: newUser });

    dispatch({
        type: GLOBALTYPES.AUTH,
        payload: {
            ...auth,
            user: { ...auth.user, following: DeleteData(auth.user.following, newUser._id) }
        }
    });

    try {
        const res = await patchDataAPI(`user/${user._id}/unfollow`, null, auth.token);
        socket.emit('unFollow', res.data.newUser);

        // Notify
        const msg = {
            id: auth.user._id,
            text: 'has unfollowed you.',
            recipients: [newUser._id],
            url: `/profile/${auth.user._id}`,
        };
        dispatch(removeNotify({ msg, auth, socket }));
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || "Failed to unfollow user." }
        });
    }
};
