import "./index.css";

const FlaggedAnswers = ({ answer, onReset, onDelete }) => {
    return (
        <div className="flaggedAs">
            <div className="aText"> {answer.text} </div>
            <div className="aVote"> {answer.vote_count} votes </div>
            <button id={"resetBtnA"} className="resetButton" onClick={() => onReset(answer._id)}>Reset</button>
            <button id={"deleteBtnA"} className="deleteButton" onClick={() => onDelete(answer._id)}>Delete</button>
        </div>
    );
};

export default FlaggedAnswers;