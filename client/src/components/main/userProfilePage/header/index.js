import React from 'react';
import './index.css';

const Header = ({ profileSummary }) => {
    return (
        <div className="profileHeader">
            <div className="profileDisplayName">
                {profileSummary.display_name}
            </div>
            <div className="profileDetails">
                <div className="profileRow">
                    <div className="profileItem">
                        <strong>Name:</strong> {profileSummary.first_name} {profileSummary.last_name}
                    </div>
                    <div className="profileItem">
                        <strong>Location:</strong> {profileSummary.location}
                    </div>
                </div>
                <div className="profileRow">
                    <div className="profileItem">
                        <strong>Email:</strong> {profileSummary.email}
                    </div>
                    <div className="profileItem">
                        <strong>Reputation:</strong> {profileSummary.reputation}
                    </div>
                </div>
                <div className="profileRowFull">
                    <div className="profileItemFull">
                        <strong>About me:</strong> {profileSummary.about_me}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
