import { useEffect, useState } from "react";

import PostModHeader from "./header";
import { getFlaggedQuestions, getFlaggedAnswers } from "../../../services/postModerationService";
import FlaggedQuestions from "./questions";
import FlaggedAnswers from "./answers";

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
        <div>
            <PostModHeader
            qCount={ flaggedQuestions && flaggedQuestions.length } 
            ansCount={ flaggedAnswers && flaggedAnswers.length}
        />
        <div>
            {flaggedQuestions.length > 0 ? (
                flaggedQuestions.map(question => (
                <FlaggedQuestions
                    key={question._id}
                    question={question}
                    />
                ))
            ) : (
                <div> No flagged questions to review. </div>
            )}
        </div>
        {flaggedAnswers.length > 0 ? (
                flaggedAnswers.map(answer => (
                <FlaggedAnswers
                    key={answer._id}
                    answer={answer}
                    />
                ))
            ) : (
                <div> No flagged answers to review. </div>
            )}
        </div>
    );
};

export default PostModerationPage;
