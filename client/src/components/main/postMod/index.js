import { useEffect, useState } from "react";
import "./index.css";

import PostModHeader from "./header";
import { getFlaggedQuestions, getFlaggedAnswers, resetQuestion, resetAnswer, deleteQuestion, deleteAnswer } from "../../../services/postModerationService";
import FlaggedQuestions from "./questions";
import FlaggedAnswers from "./answers";

const PostModerationPage = () => {
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [flaggedAnswers, setFlaggedAnswers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedFlaggedQuestions = await getFlaggedQuestions();
                if (fetchedFlaggedQuestions.error) {
                    setError(fetchedFlaggedQuestions.error);
                } else {
                    setFlaggedQuestions(fetchedFlaggedQuestions || []);
                }
                
                
                const fetchedFlaggedAnswers = await getFlaggedAnswers();
                console.log("fetched flagged answers: ", fetchedFlaggedAnswers);
                setFlaggedAnswers(fetchedFlaggedAnswers || []);
                
            } catch (error) {
                setError(error.message);
            }
        }
        fetchData();
    }, []);

    if (error) {
        return  <div className="errorMessage">Oops! You don&apos;t have access to this page.<br></br><br></br>Administrators only.</div>

    }

    const handleResetQuestion = async (qid) => {
        try {
            await resetQuestion(qid);
            setFlaggedQuestions(prev => prev.filter(q => q._id !== qid));
        } catch (error) {
            console.error("Error resetting question:", error.message);
        }
    };

    const handleDeleteQuestion = async (qid) => {
        try {
            await deleteQuestion(qid);
            setFlaggedQuestions(prev => prev.filter(q => q._id !== qid));
        } catch (error) {
            console.error("Error deleting question:", error.message);
        }
    };

    const handleResetAnswer = async (aid) => {
        try {
            await resetAnswer(aid);
            setFlaggedAnswers(prev => prev.filter(a => a._id !== aid));
        } catch (error) {
            console.error("Error resetting answer:", error.message);
        }
    };

    const handleDeleteAnswer = async (aid) => {
        try {
            await deleteAnswer(aid);
            setFlaggedAnswers(prev => prev.filter(a => a._id !== aid));
        } catch (error) {
            console.error("Error deleting answer:", error.message);
        }
    };

    return (
        <div>
            <PostModHeader
            qCount={ flaggedQuestions && flaggedQuestions.length } 
            ansCount={ flaggedAnswers && flaggedAnswers.length }
        />
        <div>
            {flaggedQuestions.length > 0 ? (
                flaggedQuestions.map(question => (
                <FlaggedQuestions
                    key={question._id}
                    question={question}
                    onReset={handleResetQuestion}
                    onDelete={handleDeleteQuestion}
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
                    onReset={handleResetAnswer}
                    onDelete={handleDeleteAnswer}
                    />
                ))
            ) : (
                <div> No flagged answers to review. </div>
            )}
        </div>
    );
};

export default PostModerationPage;
