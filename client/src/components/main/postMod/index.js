import { useEffect, useState } from "react";
import PostModHeader from "./header";
import { getFlaggedQuestions, getFlaggedAnswers } from "../../../services/postModerationService";

const PostModerationPage = () => {
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [flaggedAnswers, setFlaggedAnswers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const fetchedFlaggedQuestions = await getFlaggedQuestions();
            setFlaggedQuestions(fetchedFlaggedQuestions);

            const fetchedFlaggedAnswers = await getFlaggedAnswers();
            setFlaggedAnswers(fetchedFlaggedAnswers);
        };

        fetchData();
    }, []);

    return (
        <PostModHeader
            qCount={ flaggedQuestions && flaggedQuestions.length } 
            ansCount={ flaggedAnswers && flaggedAnswers.length}
        />
    );
};

export default PostModerationPage;
