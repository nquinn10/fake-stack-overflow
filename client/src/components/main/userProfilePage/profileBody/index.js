import React, { useEffect, useState } from 'react';
import {
    getUserAnsweredQuestions, getUserAnswerVotes,
    getUserQuestions, getUserQuestionVotes,
    getUserTags
} from "../../../../services/userService";
import Question from "../../questionPage/question";
import "../../questionPage/question/index.css";
import "../../questionPage/index.css";
import ProfileHeader from "./profileBodyHeader";

const ProfileBody = ({ activeTab, user }) => {
    const [content, setContent] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            switch (activeTab) {
                case 'questions': {
                    const questions = await getUserQuestions(); // Scoped within the block
                    setContent(questions);
                    break;
                }
                case 'answers': {
                    const answers = await getUserAnsweredQuestions(); // Scoped within the block
                    setContent(answers);
                    break;
                }
                case 'tags': {
                    const tags = await getUserTags(); // Scoped within the block
                    setContent(tags);
                    break;
                }
                case 'question_votes': {
                    const votes = await getUserQuestionVotes(user.id); // Scoped within the block
                    setContent(votes);
                    break;
                }
                case 'answer_votes': {
                    const votes = await getUserAnswerVotes(user.id); // Scoped within the block
                    setContent(votes);
                    break;
                }
                default:
                    setContent([]);
            }
        };

        fetchData().catch(console.error);
    }, [activeTab]);

    return (
        <div className="profileBody">
            {activeTab === 'questions' && (
                <>
                    <ProfileHeader
                        titleText="My Questions"
                        itemCount={content.length}
                    />
                    <div className="question_list">
                        {content.map((q, idx) => (
                            <Question
                                q={q}
                                key={idx}
                                clickTag={() => {}}
                                handleAnswer={() => {}}
                            />
                        ))}
                        {!content.length && <div>No Questions Found</div>}
                    </div>
                </>
            )}
            {/* Render other types of content for different tabs similarly */}
        </div>
    );
};

export default ProfileBody;