import "./index.css";

const FlaggedQuestions = ({ question, onReset, onDelete }) => {
    return (
        <div className="flaggedQs">
            <div className="qTitle"> {question.title} </div>
            <div className="qText"> {question.text} </div>
            <div className="qVote"> {question.vote_count} votes </div>
            <button className="resetButton" onClick={() => onReset(question._id)}>Reset Question</button>
            <button className="deleteButton" onClick={() => onDelete(question._id)}>Delete Question</button>

        </div>
    );
};

export default FlaggedQuestions;