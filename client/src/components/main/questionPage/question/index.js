import { getMetaData } from "../../../../tool";
import "./index.css";

const Question = ({ q, clickTag, handleAnswer }) => {
     
    const truncateText = (text, maxLength = 98) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '    ... see more' : text;
    };

    const textPreview = truncateText(q.text);
    
    return (
        <div
            className="question right_padding"
            onClick={() => {
                handleAnswer(q._id);
            }}
        >
            <div className="postStats">
                <div>{q.answers.length || 0} answers</div>
                <div>{q.views} views</div>
                <div>{q.vote_count} votes</div>
            </div>
            <div className="question_mid">
                <div className="postTitle">{q.title}</div>
                <div className="postText">{textPreview}</div>
                <div className="question_tags">
                    {q.tags.map((tag, idx) => {
                        return (
                            <button
                                key={idx}
                                className="question_tag_button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clickTag(tag.name);
                                }}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="lastActivity">
                <div className="question_author">{q.asked_by.display_name}</div>
                <div>&nbsp;</div>
                <div className="question_meta">
                    asked {getMetaData(new Date(q.ask_date_time))}
                </div>
            </div>
        </div>
    );
};

export default Question;
