import "./index.css";

const FlaggedAnswers = ({ answer }) => {
    return (
        <div className="flaggedAs">
            <div> {answer.text} </div>
            <div> {answer.vote_count} votes </div>
        </div>
    );
};

export default FlaggedAnswers;