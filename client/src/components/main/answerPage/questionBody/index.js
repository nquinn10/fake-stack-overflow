import "./index.css";
import React, { useState, useEffect } from "react";
import { handleHyperlink } from "../../../../tool";
// import { FiArrowUpCircle, FiArrowDownCircle } from "react-icons/fi"; 
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";
import { castVote } from "../../../../services/voteService";
import { toast } from 'react-toastify';

// Component for the Question's Body
const QuestionBody = ({ views, text, askby, meta, initialVote, qid }) => {
    const [voteCount, setVoteCount] = useState(initialVote);
    const [activeVote, setActiveVote] = useState(null);


    // Update vote count when initialVote changes
    useEffect(() => {
        if (initialVote !== undefined) {
            setVoteCount(Number(initialVote));
        }
    }, [initialVote]);


    const handleVote = async (voteType) => {
        const response = await castVote(qid, voteType, 'Question');
        if (response.vote_count !== undefined) {
            setVoteCount(response.vote_count);
            setActiveVote(voteType);
        } else if (response.error) {
            toast.error(response.error);
        }
    };
    
    return (
        <div id="questionBody" className="questionBody right_padding">
            <div className="questionStatsContainer">
                <div className="voteContainerQuestion">
                    <BiSolidUpArrow className={`bold_title voteIcon upvote ${activeVote === 'upvote' ? 'active' : ''}`} onClick={() => handleVote('upvote')} />
                    <div className="bold_title answer_question_vote">{voteCount}</div>
                    <BiSolidDownArrow className={`bold_title voteIcon downvote ${activeVote === 'downvote' ? 'active' : ''}`} onClick={() => handleVote('downvote')}/>
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
