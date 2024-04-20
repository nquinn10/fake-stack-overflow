import "./index.css";
import React from "react";
import { handleHyperlink } from "../../../../tool";
import { GoThumbsup, GoThumbsdown } from "react-icons/go";

// Component for the Question's Body
const QuestionBody = ({ views, text, askby, meta, vote }) => {
    return (
        <div id="questionBody" className="questionBody right_padding">
            <div className="questionStatsContainer">
                <div className="voteContainer">
                    <GoThumbsup className="bold_title voteIcon upvote"/>
                    <div className="bold_title answer_question_vote">{vote} votes</div>
                    <GoThumbsdown className="bold_title voteIcon downvote"/>
                </div>
                <div className="bold_title answer_question_view">{views} views</div>
            </div>
            <div className="answer_question_text">{handleHyperlink(text)}</div>
            <div className="answer_question_right">
                <div className="question_author">{askby}</div>
                <div className="answer_question_meta">asked {meta}</div>
            </div>
        </div>
    );
};

export default QuestionBody;
