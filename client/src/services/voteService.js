import { REACT_APP_API_URL, api } from "./config";

const VOTE_API_URL = `${REACT_APP_API_URL}/vote`;

const castVote = async (referenceId, voteType, onModel) => {
    try {
        const response = await api.post(`${VOTE_API_URL}/vote`, {
            referenceId, 
            voteType, 
            onModel
        });
        return response.data; // on successful vote
    } catch (error) {
        console.error("Vote error:", error.response || error);
        // Check the status code and set a custom message accordingly
        if (error.response) {
            switch (error.response.status) {
                case 409:
                    return { error: "You have already cast this vote." };
                case 403:
                    return { error: "You do not have enough reputation points to vote." };
                default:
                    return { error: error.response.data?.message || 'An unexpected error occurred' };
            }
        } else {
            return { error: 'An unexpected error occurred' };
        }
    }
};
export { castVote };