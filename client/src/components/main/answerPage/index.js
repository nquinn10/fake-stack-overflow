import { useEffect, useState } from "react";
import { getMetaData } from "../../../tool";
import Answer from "./answer";
import AnswerHeader from "./header";
import "./index.css";
import QuestionBody from "./questionBody";
import { getQuestionById } from "../../../services/questionService";

// Component for the Answers page
const AnswerPage = ({ qid, handleNewQuestion, handleNewAnswer }) => {
    const [question, setQuestion] = useState({});
    useEffect(() => {
        const fetchData = async () => {
            let res = await getQuestionById(qid);
            setQuestion(res || {});
        };
        fetchData().catch((e) => console.log(e));
    }, [qid]);

    return (
        <>
            <AnswerHeader
                ansCount={
                    question && question.answers && question.answers.length
                }
                title={question && question.title}
                handleNewQuestion={handleNewQuestion}
            />
            <QuestionBody
                views={question && question.views}
                initialVote= {question && question.vote_count}
                text={question && question.text}
                askby={question && question.asked_by?.display_name}
                meta={question && getMetaData(new Date(question.ask_date_time))}
                qid={question && question._id}
            />
            {question &&
             question.answers &&
             question.answers.map((a, idx) => (
                 <Answer
                     key={idx}
                     text={a.text}
                     ansBy={a.ans_by?.display_name}
                     meta={getMetaData(new Date(a.ans_date_time))}
                     vote={a.vote_count}
                     aid={a._id}
                 />
             ))}
            <button
                className="bluebtn ansButton"
                onClick={() => {
                    handleNewAnswer();
                }}
            >
                Answer Question
            </button>
        </>
    );
};

export default AnswerPage;
