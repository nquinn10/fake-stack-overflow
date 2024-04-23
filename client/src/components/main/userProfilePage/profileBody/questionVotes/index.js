import React from "react";
import "./index.css";

const QuestionVotes = ({ q }) => {

    if (!q || !q.tags) {
        console.error("Question data is invalid or incomplete:", q);
        return <div>Invalid question data</div>;
    }

    return (
        <div className="question right_padding">
            <div className="postStats">
                <div>{q.views} views</div>
                <div>{q.vote_count} votes</div>
            </div>
            <div className="question_mid">
                <div className="postTitle">{q.title}</div>
                <div className="postText">{q.text}</div>
                <div className="question_tags">
                    {q.tags.map((tag, idx) => (
                        <span key={idx} className="question_tag_button">
                            {tag.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionVotes;
