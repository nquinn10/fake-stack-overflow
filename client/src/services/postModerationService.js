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

const resetQuestion = async (qid) => {
    try {
        const response = await api.put(`${POSTMOD_API_URL}/resetQuestion/${qid}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Question not found');
        } else if (error.response && error.response.status === 500) {
            throw new Error('Internal server error');
        }
        throw error;
    }
}

const deleteQuestion = async (qid) => {
    try {
        const response = await api.delete(`${POSTMOD_API_URL}/deleteQuestion/${qid}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Question not found');
        } else if (error.response && error.response.status === 403) {
            throw new Error('This question is not flagged for deletion');
        } else if (error.response && error.response.status === 500) {
            throw new Error('Internal server error');
        }
        throw error;
    }
}

const resetAnswer = async (aid) => {
    try {
        const response = await api.put(`${POSTMOD_API_URL}/resetAnswer/${aid}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Answer not found');
        } else if (error.response && error.response.status === 500) {
            throw new Error('Internal server error');
        }
        throw error;
    }
}

const deleteAnswer = async (aid) => {
    try {
        const response = await api.delete(`${POSTMOD_API_URL}/deleteAnswer/${aid}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Answer not found');
        } else if (error.response && error.response.status === 403) {
            throw new Error('This answer is not flagged for deletion');
        } else if (error.response && error.response.status === 500) {
            throw new Error('Internal server error');
        }
        throw error;
    }
}





export { getFlaggedQuestions, getFlaggedAnswers, resetQuestion, resetAnswer, deleteQuestion, deleteAnswer };  