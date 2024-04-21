import { REACT_APP_API_URL, api } from "./config";

const USER_API_URL = `${REACT_APP_API_URL}/user`;

// This file will be the user service for a User object. 
// Once implemented, this file will contain the functionality of the API endpoints 
// and how they should be called, and with which parameters if necessary

const login = async (email, password) => {
    const response = await api.post(`${USER_API_URL}/login`, { email, password });
    return response.data;
};

const register = async (userData) => {
    const response = await api.post(`${USER_API_URL}/register`, userData);
    return response.data;
};

const getUserProfileSummary = async () => {
    const response = await api.get(`${USER_API_URL}/profile`);
    return response.data;
};

export { login, register, getUserProfileSummary };