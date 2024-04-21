import React from "react";
import "./index.css";
import {getMetaData} from "../../../../../tool";

const Question = ({ q, onEdit, onDelete }) => {
    return (
        <div className="question right_padding">
            <div className="postStats">
                <div>{q.answers.length || 0} answers</div>
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
            <div className="lastActivity">
                <div className="question_meta">
                    asked {getMetaData(new Date(q.ask_date_time))}
                </div>
                <div className="question_controls">
                    <button onClick={() => onEdit(q)}>Edit</button>
                    <button onClick={() => onDelete(q._id)}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default Question;
