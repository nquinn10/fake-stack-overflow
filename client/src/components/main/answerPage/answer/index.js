import { handleHyperlink } from "../../../../tool";
import "./index.css";
// import { FiArrowUpCircle, FiArrowDownCircle } from "react-icons/fi"; 
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";

// Component for the Answer Page
const Answer = ({ text, ansBy, meta, vote }) => {
    return (
        <div className="answer right_padding">
            <div className="voteContainerAnswer">
                    <BiSolidUpArrow className="bold_title voteIcon upvote"/>
                    <div className="answerVote">{vote}</div>
                    <BiSolidDownArrow className="bold_title voteIcon downvote"/>
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
