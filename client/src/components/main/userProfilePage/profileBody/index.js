import React, { useEffect, useState } from 'react';

const ProfileBody = ({ activeTab, user }) => {
    const [content, setContent] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            switch (activeTab) {
                case 'questions':
                    setContent(await getUserQuestions(user.id));
                    break;
                case 'answers':
                    setContent(await getUserAnsweredQuestions(user.id));
                    break;
                case 'tags':
                    setContent(await getUserTags(user.id));
                    break;
                case 'votes':
                    setContent(await getUserQuestionVotes(user.id));
                    break;
                default:
                    setContent([]);
            }
        };

        fetchData();
    }, [activeTab, user.id]);

    return (
        <div className="profileBody">
            {content.map(item => (
                <div key={item.id}>{item.title || item.name}</div>
            ))}
        </div>
    );
};

export default ProfileBody;