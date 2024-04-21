import React, { useEffect, useState } from 'react';
import {
    getUserAnsweredQuestions, getUserAnswerVotes,
    getUserQuestions, getUserQuestionVotes,
    getUserTags
} from "../../../../services/userService";
import ProfileHeader from "./profileBodyHeader";

import Question from "./question";
import EditQuestionForm from "./editQuestionForm";
import {deleteQuestion} from "../../../../services/questionService";
import UserAnswer from "./answer";
import EditAnswerForm from "./editAnswerForm";

const ProfileBody = ({ activeTab, user }) => {
    const [content, setContent] = useState([]);
    //const [editingQuestionId, setEditingQuestionId] = useState(null);
    //const [isEditing, setIsEditing] = useState(false);
    //const [questionToEdit, setQuestionToEdit] = useState(null);
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);
    const [isEditingAnswer, setIsEditingAnswer] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    const handleEditClick = (item) => {
        if (activeTab === 'questions') {
            setIsEditingQuestion(true);
            setIsEditingAnswer(false);
        } else if (activeTab === 'answers') {
            setIsEditingAnswer(true);
            setIsEditingQuestion(false);
        }
        setItemToEdit(item);
    };

    const handleSave = async () => {
        if (activeTab === 'questions') {
            setIsEditingQuestion(false);
            setItemToEdit(null);
            const updatedQuestions = await getUserQuestions();
            setContent(updatedQuestions);
        } else if (activeTab === 'answers') {
            setIsEditingAnswer(false)
            setItemToEdit(null);
            const updatedAnswers = await getUserAnsweredQuestions();
            setContent(updatedAnswers);
        }

    };

    const handleCancel = () => {
        setIsEditingQuestion(false);
        setIsEditingAnswer(false);
        setItemToEdit(null);
    };

    const handleDelete = async (questionId) => {
        const result = await deleteQuestion(questionId);
        if (!result.error) {
            const updatedQuestions = await getUserQuestions();
            setContent(updatedQuestions);
        } else {
            console.error('Failed to delete the question:', result.error);
        }
    };

    const handleEditAnswer = (answer) => {
        setIsEditingAnswer(true);
        setIsEditingQuestion(false);
        setItemToEdit(answer);
    };

    const handleDeleteAnswer = async (answerId) => {
        // Set up logic to delete the answer
        console.log("Delete Answer", answerId);
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
                    data = [];
            }
            console.log("Fetched data:", data);
            setContent(data || []);
        };

        fetchData().catch(console.error);
    }, [activeTab]);

    if (isEditingQuestion) {
        return (
            <EditQuestionForm
                question={itemToEdit}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    if (isEditingAnswer) {
        return (
            <EditAnswerForm
                answer={itemToEdit}
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
                                onDelete={handleDelete}
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
                    {content && content.length > 0 ? (
                        <div className="answer_list">
                            {content.map((item, idx) => (
                                <UserAnswer
                                    key={idx}
                                    item={item}
                                    onEditAnswer={handleEditAnswer}
                                    onDeleteAnswer={handleDeleteAnswer}
                                />
                            ))}
                        </div>
                    ) : (
                         <div>No Answers Found</div>
                     )}
                </>
            )}
        </div>
    );
};

export default ProfileBody;