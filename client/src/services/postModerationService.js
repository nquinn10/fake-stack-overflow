import { REACT_APP_API_URL, api } from "./config";

const POSTMOD_API_URL = `${REACT_APP_API_URL}/postModeration`;

// get flagged questions
const getFlaggedQuestions = async () => {
    const res = await api.get(`${POSTMOD_API_URL}/flaggedQuestions`);

    return res.data;
}

// get flagged answers
const getFlaggedAnswers = async () => {
    const res = await api.get(`${POSTMOD_API_URL}/flaggedAnswers`);

    return res.data
}


export { getFlaggedQuestions, getFlaggedAnswers };  