import React, { useEffect, useState } from 'react';
import {
    getUserAnsweredQuestions, getUserAnswerVotes,
    getUserQuestions, getUserQuestionVotes,
    getUserTags
} from "../../../../services/userService";
import ProfileHeader from "./profileBodyHeader";
import UserAnswerDisplay from "./userAnswerDisplay";
import Question from "./question";
import EditQuestionForm from "./editQuestionForm";

const ProfileBody = ({ activeTab, user }) => {
    const [content, setContent] = useState([]);
    //const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [questionToEdit, setQuestionToEdit] = useState(null);

    const handleEditClick = (question) => {
        setIsEditing(true);
        setQuestionToEdit(question);
    };

    const handleSave = async (updatedQuestion) => {
        const updatedContent = content.map(q => {
            if (q._id === updatedQuestion._id) {
                return updatedQuestion;  // Update the specific question with the new data
            }
            return q;
        });
        setContent(updatedContent);  // Update the state with the new question list

        setIsEditing(false);
        setQuestionToEdit(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setQuestionToEdit(null);
    };

    useEffect(() => {
        console.log("Fetching data for tab:", activeTab);
        const fetchData = async () => {
            let data = [];
            switch (activeTab) {
                case 'questions': {
                    data = await getUserQuestions(); // Scoped within the block
                    break;
                }
                case 'answers': {
                    data = await getUserAnsweredQuestions(); // Scoped within the block
                    break;
                }
                case 'tags': {
                    data = await getUserTags(); // Scoped within the block
                    break;
                }
                case 'question_votes': {
                    data = await getUserQuestionVotes(user.id); // Scoped within the block
                    break;
                }
                case 'answer_votes': {
                    data = await getUserAnswerVotes(user.id); // Scoped within the block
                    break;
                }
                default:
                    setContent([]);
            }
            setContent(data || []);
        };

        fetchData().catch(console.error);
    }, [activeTab]);

    if (isEditing) {
        return (
            <EditQuestionForm
                question={questionToEdit}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    return (
        <div className="profileBody">
            {activeTab === 'questions' && (
                <>
                    <ProfileHeader
                        titleText="My Questions"
                        itemCount={content.length}
                    />
                    <div className="question_list">
                        {content.map((question) => (
                            <Question
                                key={question._id}  // Use the question ID for a unique key
                                q={question}
                                onEdit={handleEditClick}
                                onDelete={(questionId) => {
                                    // Implement the logic to handle delete, such as showing a confirmation
                                    console.log('Deleting question', questionId);
                                }}
                            />
                        ))}
                        {!content.length && <div className="no-questions">No Questions Found</div>}
                    </div>
                </>
            )}
            {activeTab === 'answers' && (
                <>
                    <ProfileHeader
                        titleText="My Answers"
                        itemCount={content.length}
                    />
                    <div className="answer_list">
                        {content.map((item, idx) => (
                            <UserAnswerDisplay key={idx} item={item} />
                        ))}
                        {!content.length && <div>No Answers Found</div>}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfileBody;