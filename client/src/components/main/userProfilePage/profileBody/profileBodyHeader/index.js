import React from 'react';
import './index.css';

const ProfileHeader = ({ titleText, itemCount, activeTab, onUpvoteClick, onDownvoteClick }) => {
    return (
        <div className="profileHeader">
            <h1 className="profileTitle">{titleText}</h1>
            <div className="itemCount">{itemCount} items</div>
            {(activeTab === 'question_votes' || activeTab === 'answer_votes') && (
                <div className="voteButtons">
                    <button onClick={onUpvoteClick}>Upvotes</button>
                    <button onClick={onDownvoteClick}>Downvotes</button>
                </div>
            )}
        </div>
    );
};

export default ProfileHeader;