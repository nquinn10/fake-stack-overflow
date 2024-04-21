import "./index.css";

// Header for the Post Moderation page
const PostModHeader = ({ ansCount, qCount, title }) => {
    return (
        <div id="postModHeader" className="space_between right_padding">
            <div className="bold_title">{title}</div>
            {qCount !== undefined && <div className="bold_title">{qCount} flagged questions</div>}
            {ansCount !== undefined && <div className="bold_title">{ansCount} flagged answers</div>}
        </div>
    );
};

export default PostModHeader;
