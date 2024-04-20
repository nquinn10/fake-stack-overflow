import "./index.css";

// Header for the Post Moderation page
const PostModHeader = ({ ansCount, qCount }) => {
    return (
        <div id="postModHeader" className="space_between right_padding">
            <div className="bold_title">Flagged Content To Review:</div>
            <div className="bold_title">{qCount} flagged questions</div>
            <div className="bold_title">{ansCount} flagged answers</div>
        </div>
    );
};

export default PostModHeader;
