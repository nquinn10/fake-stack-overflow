import React, {useEffect, useState} from 'react';
import Header from './header';
import ProfileBody from './profileBody';
import SidebarNav from './sidebarNav';
import './index.css';
import {getUserProfileSummary} from "../../../services/userService";
import EditProfileForm from "./editProfileForm";

const UserProfilePage = () => {
    const [activeTab, setActiveTab] = useState('questions');
    const [profileSummary, setProfileSummary] = useState({});
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchProfileSummary = async () => {
            const response = await getUserProfileSummary();
            if (response) {
                setProfileSummary(response);
            }
        };
        fetchProfileSummary().catch((e) => console.log(e));
    }, []);


    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab !== 'edit_profile') {
            setEditMode(false);
        } else {
            setEditMode(true);
        }
    };

    const handleSaveProfile = async () => {
        const response = await getUserProfileSummary();
        console.log("Profile Summary:", response);
        if (response) {
            setProfileSummary(response);
        }
        setEditMode(false); // Exit edit mode after saving
        setActiveTab('questions');
    };

    const handleCancel = () => {
        setEditMode(false);
        setActiveTab('questions');
    };

    return (
        <div className="userProfilePage">
            <Header profileSummary={profileSummary}/>
            <div className="profileContent">
                <SidebarNav onChangeTab={handleTabChange} selected={activeTab} />
                {editMode ?
                 <EditProfileForm profile={profileSummary} onSave={handleSaveProfile} onCancel={handleCancel}  /> :
                 <ProfileBody activeTab={activeTab} profileSummary={profileSummary} />
                }
            </div>
        </div>
    );
};

export default UserProfilePage;