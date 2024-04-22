import React from "react";
import "./index.css";

const Tag = ({ t }) => {
    return (
        <div className="tagNode" >
            <div className="tagName">{t.name}</div>
            <div>{t.count} questions</div>
        </div>
    );
};

export default Tag;