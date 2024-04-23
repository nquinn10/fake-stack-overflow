import { handleHyperlink } from "../../../../tool";
import "./index.css";
import React, { useState, useEffect } from "react";
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";
import { castVote } from "../../../../services/voteService";
import { toast } from 'react-toastify';

// Component for the Answer Page
const Answer = ({ text, ansBy, meta, initialVote, aid }) => {
    const [voteCount, setVoteCount] = useState(Number(initialVote));
    const [activeVote, setActiveVote] = useState('');


     // Update vote count when initialVote changes
     useEffect(() => {
        if (initialVote !== undefined) {
            setVoteCount(Number(initialVote));
        }
    }, [initialVote]);

    const handleVote = async (voteType) => {
        const response = await castVote(aid, voteType, 'Answer');
        if (response && response.vote_count !== undefined) {
            setVoteCount(response.vote_count);
            setActiveVote(voteType);
        } else if (response.error) {
            toast.error(response.error);
        }
    };

    return (
        <div className="answer right_padding">
            <div className="voteContainerAnswer">
                    <BiSolidUpArrow id={"upVoteA"} className={`bold_title voteIcon upvote ${activeVote === 'upvote' ? 'active' : ''}`} onClick={() => handleVote('upvote')} />
                    <div id={"vote_countA"} className="answerVote">{voteCount}</div>
                    <BiSolidDownArrow id={"downVoteA"} className={`bold_title voteIcon downvote ${activeVote === 'downvote' ? 'active' : ''}`} onClick={() => handleVote('downvote')}/>
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
