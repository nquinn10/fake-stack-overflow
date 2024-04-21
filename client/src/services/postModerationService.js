import { REACT_APP_API_URL, api } from "./config";

const POSTMOD_API_URL = `${REACT_APP_API_URL}/postModeration`;

// get flagged questions with error handling
const getFlaggedQuestions = async () => {
    try {
        const response = await api.get(`${POSTMOD_API_URL}/flaggedQuestions`);
        return response.data;
    } catch (error) {
       return { data: null, error: error.response?.data || 'An unexpected error occurred' };
    }
}

// get flagged answers with error handling
const getFlaggedAnswers = async () => {
    try {
        const response = await api.get(`${POSTMOD_API_URL}/flaggedAnswers`);
        return response.data;
    } catch (error) {
        return { data: null, error: error.response?.data || 'An unexpected error occurred' };
    }
}

const resetQuestion = async (qid) => {
    try {
        const response = await api.put(`${POSTMOD_API_URL}/resetQuestion/${qid}`);
        return response.data;
    } catch (error) {
        return { error: error.response?.data || 'An unexpected error occurred' };
    }
}

const deleteQuestion = async (qid) => {
    try {
        const response = await api.delete(`${POSTMOD_API_URL}/deleteQuestion/${qid}`);
        return response.data;
    } catch (error) {
        return { error: error.response?.data || 'An unexpected error occurred' };
    }
}

const resetAnswer = async (aid) => {
    try {
        const response = await api.put(`${POSTMOD_API_URL}/resetAnswer/${aid}`);
        return response.data;
    } catch (error) {
        return { error: error.response?.data || 'An unexpected error occurred' };
    }
}

const deleteAnswer = async (aid) => {
    try {
        const response = await api.delete(`${POSTMOD_API_URL}/deleteAnswer/${aid}`);
        return response.data;
    } catch (error) {
        return { error: error.response?.data || 'An unexpected error occurred' };
    }
}




export { getFlaggedQuestions, getFlaggedAnswers, resetQuestion, resetAnswer, deleteQuestion, deleteAnswer };  