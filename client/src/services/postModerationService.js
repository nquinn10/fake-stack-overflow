import { REACT_APP_API_URL, api } from "./config";

const POSTMOD_API_URL = `${REACT_APP_API_URL}/postModeration`;

// get flagged questions with error handling
const getFlaggedQuestions = async () => {
    try {
        const response = await api.get(`${POSTMOD_API_URL}/flaggedQuestions`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            throw new Error('Access denied. You do not have the necessary permissions to view flagged questions.');
        }
        throw new Error('Failed to fetch flagged questions due to an unexpected error.');
    }
}

// get flagged answers with error handling
const getFlaggedAnswers = async () => {
    try {
        const response = await api.get(`${POSTMOD_API_URL}/flaggedAnswers`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            throw new Error('Access denied. You do not have the necessary permissions to view flagged answers.');
        }
        throw new Error('Failed to fetch flagged answers due to an unexpected error.');
    }
}


export { getFlaggedQuestions, getFlaggedAnswers };  