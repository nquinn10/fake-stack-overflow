import React from "react";
import "./index.css";

const AnswerVotes = ({ a }) => {

    if (!a) {
        console.error("Answer data is invalid or incomplete:", a);
        return <div>Invalid answer data</div>;
    }

    return (
        <div className="question right_padding">
            <div className="postStats">
                <div>{a.vote_count} votes</div>
            </div>
            <div className="question_mid">
                <div className="postText">{a.text}</div>
            </div>
        </div>
    );
};

export default AnswerVotes;
