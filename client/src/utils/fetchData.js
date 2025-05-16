import axios from 'axios';

const REACT_API_URL="https://aura-social-media-app.vercel.app";
/**
 * GET request
 * @param {string} url - API endpoint
 * @param {string} token - Authorization token
 * @returns {Promise} - Axios response promise
 */
export const getDataAPI = async (url, token) => {
    const res = await axios.get(`/api/${url}`, {
        headers: { Authorization: token }
    });
    return res;
};

/**
 * POST request
 * @param {string} url - API endpoint
 * @param {object} post - Data to post
 * @param {string} token - Authorization token
 * @returns {Promise} - Axios response promise
 */
export const postDataAPI = async (url, post, token) => {
    const res = await axios.post(`/api/${url}`, post, {
        headers: { Authorization: token }
    });
    return res;
};

/**
 * PUT request
 * @param {string} url - API endpoint
 * @param {object} post - Data to put (replace)
 * @param {string} token - Authorization token
 * @returns {Promise} - Axios response promise
 */
export const putDataAPI = async (url, post, token) => {
    const res = await axios.put(`/api/${url}`, post, {
        headers: { Authorization: token }
    });
    return res;
};

/**
 * PATCH request
 * @param {string} url - API endpoint
 * @param {object} post - Partial data to update
 * @param {string} token - Authorization token
 * @returns {Promise} - Axios response promise
 */
export const patchDataAPI = async (url, post, token) => {
    const res = await axios.patch(`/api/${url}`, post, {
        headers: { Authorization: token }
    });
    return res;
};

/**
 * DELETE request
 * @param {string} url - API endpoint
 * @param {string} token - Authorization token
 * @returns {Promise} - Axios response promise
 */
export const deleteDataAPI = async (url, token) => {
    const res = await axios.delete(`/api/${url}`, {
        headers: { Authorization: token }
    });
    return res;
};
