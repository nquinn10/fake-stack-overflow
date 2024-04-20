import { REACT_APP_API_URL, api } from "./config";

const USER_API_URL = `${REACT_APP_API_URL}/user`;

// This file will be the user service for a User object. 
// Once implemented, this file will contain the functionality of the API endpoints 
// and how they should be called, and with which parameters if necessary

const login = async (username, password) => {
    try {
        const response = await api.post(`${USER_API_URL}/login`, { username, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export { login };