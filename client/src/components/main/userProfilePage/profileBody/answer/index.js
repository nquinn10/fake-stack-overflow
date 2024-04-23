import React from 'react';
import "./index.css";
//import {getMetaData} from "../../../../../tool";
// const UserAnswer = ({ item, onEditAnswer, onDeleteAnswer }) => {
const UserAnswer = ({ item, onEditAnswer, onDeleteAnswer }) => {

    const { question, answer } = item;

    if (!question || !answer) {
        console.error('UserAnswer component received invalid data:', item);
        return <div>Error loading question or answer data.</div>;
    }

    return (
        <div className="user-answer-container">
            <div className="question right_padding">
                <div className="postStats">
                    <div>{question.views} views</div>
                    <div>{question.vote_count} votes</div>
                </div>
                <div className="question_mid">
                    <div className="postTitle">{question.title}</div>
                    <div className="postText">{question.text}</div>
                </div>
            </div>

            <div className="answer right_padding">  
                <div className="postStats">
                </div>
                <div className="question_mid">
                    <div className="postTitle">Answer</div> 
                    <div id={"answer_postText"} className="postText">{answer.text}</div>
                </div>
                <div className="lastActivity">
                    <div className="question_controls">
                        <button id={"answerEditBtn"} onClick={() => onEditAnswer(answer)}>Edit</button>
                        <button id={"answerDeleteBtn"} onClick={() => onDeleteAnswer(answer._id)}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAnswer;