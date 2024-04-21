import React from 'react';
import './index.css';

const ProfileHeader = ({ titleText, itemCount }) => {
    return (
        <div className="profileHeader">
            <h1 className="profileTitle">{titleText}</h1>
            <div className="itemCount">{itemCount} items</div>
        </div>
    );
};

export default ProfileHeader;