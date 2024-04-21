import React from 'react';
import "./index.css";

const SidebarNav = ({ onChangeTab, selected }) => {
    const handleTabClick = (tab) => {
        onChangeTab(tab);
    };

    return (
        <div id="sideBarNav" className="sideBarNav">
            <div
                id="menu_question"
                className={`menu_button ${selected === 'questions' ? 'menu_selected' : ''}`}
                onClick={() => handleTabClick('questions')}
            >
                Questions
            </div>
            <div
                id="menu_answer"
                className={`menu_button ${selected === 'answers' ? 'menu_selected' : ''}`}
                onClick={() => handleTabClick('answers')}
            >
                Answers
            </div>
            <div
                id="menu_tag"
                className={`menu_button ${selected === 'tags' ? 'menu_selected' : ''}`}
                onClick={() => handleTabClick('tags')}
            >
                Tags
            </div>
            <div
                id="menu_vote"
                className={`menu_button ${selected === 'votes' ? 'menu_selected' : ''}`}
                onClick={() => handleTabClick('votes')}
            >
                Votes
            </div>
        </div>
    );
};

export default SidebarNav;
