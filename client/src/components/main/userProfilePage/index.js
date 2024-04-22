import React, {useEffect, useState} from 'react';
import Header from './header';
import ProfileBody from './profileBody';
import SidebarNav from './sidebarNav';
import './index.css';
import {getUserProfileSummary} from "../../../services/userService";

const UserProfilePage = () => {
    const [activeTab, setActiveTab] = useState('questions');
    const [profileSummary, setProfileSummary] = useState({});

    useEffect(() => {
        // Simulating fetching profile summary
        const fetchProfileSummary = async () => {
            // Implement the fetch logic here, or call userProfileSummary if this part of server-side code
            const response = await getUserProfileSummary(); // Example endpoint
            if (response) {
                setProfileSummary(response);
            }
        };
        fetchProfileSummary().catch((e) => console.log(e));
    }, []);


    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="userProfilePage">
            <Header profileSummary={profileSummary} />
            <div className="profileContent">
                <SidebarNav onChangeTab={handleTabChange} selected={activeTab} />
                <ProfileBody activeTab={activeTab} />
            </div>
        </div>
    );
};

export default UserProfilePage;