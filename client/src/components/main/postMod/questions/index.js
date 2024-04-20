import "./index.css";

const FlaggedQuestions = ({ question }) => {
    return (
        <div className="flaggedQs">
            <div> {question.title} </div>
            <div> {question.text} </div>
            <div> {question.vote_count} votes </div>
        </div>
    );
};

export default FlaggedQuestions;