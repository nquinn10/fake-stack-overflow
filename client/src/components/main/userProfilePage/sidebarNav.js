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
                id="menu_question_vote"
                className={`menu_button ${selected === 'question_votes' ? 'menu_selected' : ''}`}
                onClick={() => handleTabClick('question_votes')}
            >
                Question Votes
            </div>
            <div
                id="menu_answer_vote"
                className={`menu_button ${selected === 'answer_votes' ? 'menu_selected' : ''}`}
                onClick={() => handleTabClick('answer_votes')}
            >
                Answer Votes
            </div>
            <div
                id="menu_proile_edit"
                className={`menu_button ${selected === 'edit_profile' ? 'menu_selected' : ''}`}
                onClick={() => handleTabClick('edit_profile')}
            >
                Edit Profile
            </div>
        </div>
    );
};

export default SidebarNav;
