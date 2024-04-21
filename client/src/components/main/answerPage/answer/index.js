import { handleHyperlink } from "../../../../tool";
import "./index.css";
import React, { useState } from "react";
// import { FiArrowUpCircle, FiArrowDownCircle } from "react-icons/fi"; 
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";
import { castVote } from "../../../../services/voteService";

// Component for the Answer Page
const Answer = ({ text, ansBy, meta, vote, aid }) => {
    const [activeVote, setActiveVote] = useState(null);

    const handleVote = async (voteType) => {
        try {
            const response = await castVote(aid, voteType, 'Answer');
            if (response) {
                setActiveVote(voteType);
            }
        } catch (error) {
            <div> You may not have enough reputation points to vote! <br></br>
            Try engaging more with the community! </div>
        }
    }; 

    return (
        <div className="answer right_padding">
            <div className="voteContainerAnswer">
                    <BiSolidUpArrow className={`bold_title voteIcon upvote ${activeVote === 'upvote' ? 'active' : ''}`} onClick={() => handleVote('upvote')} />
                    <div className="answerVote">{vote}</div>
                    <BiSolidDownArrow className={`bold_title voteIcon downvote ${activeVote === 'downvote' ? 'active' : ''}`} onClick={() => handleVote('downvote')}/>
                </div>
            <div id="answerText" className="answerText">
                {handleHyperlink(text)}
            </div>
            <div className="answerAuthor">
                <div className="answer_author">{ansBy}</div>
                <div className="answer_question_meta">{meta}</div>
            </div>
        </div>
    );
};

export default Answer;
