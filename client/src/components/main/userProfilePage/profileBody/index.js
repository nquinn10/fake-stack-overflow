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
import {deleteAnswer} from "../../../../services/answerService";
import QuestionVotes from "./questionVotes";
import AnswerVotes from "./answerVotes";

const ProfileBody = ({ activeTab }) => {
    const [content, setContent] = useState([]);
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
        const result = await deleteAnswer(answerId);
        if (!result.error) {
            const updatedAnswers = await getUserAnsweredQuestions();
            setContent(updatedAnswers);
        } else {
            console.error('Failed to delete the question:', result.error);
        }
    };

    const fetchVotes = async (voteType) => {
        if (activeTab === 'question_votes') {
            const data = await getUserQuestionVotes(`${voteType}`);
            setContent(data);
        } else if (activeTab === 'answer_votes') {
            const data = await getUserAnswerVotes(`${voteType}`);
            setContent(data);
        }
    };

    const handleUpvoteClick = () => {
        fetchVotes('upvote');
    };

    const handleDownvoteClick = () => {
        fetchVotes('downvote');
    };

    useEffect(() => {
        console.log("Fetching data for tab:", activeTab);
        const fetchData = async () => {
            let data = [];
            switch (activeTab) {
                case 'questions': {
                    data = await getUserQuestions();
                    break;
                }
                case 'answers': {
                    data = await getUserAnsweredQuestions();
                    break;
                }
                case 'tags': {
                    data = await getUserTags();
                    break;
                }
                case 'question_votes': {
                    data = await getUserQuestionVotes();
                    break;
                }
                case 'answer_votes': {
                    data = await getUserAnswerVotes();
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
                        activeTab={"questions"}
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
                        activeTab={"answers"}
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
            {activeTab === 'question_votes' && (
                <>
                    <ProfileHeader
                        titleText="My Question Votes"
                        itemCount={content.length}
                        activeTab={"question_votes"}
                        onUpvoteClick={handleUpvoteClick}
                        onDownvoteClick={handleDownvoteClick}
                    />
                    <div className="question_list">
                        {content.map((vote) => (
                            <QuestionVotes
                                key={vote._id}
                                q={vote.referenceId}
                            />
                        ))}
                        {!content.length && <div className="no-questions">No Questions Votes Found</div>}
                    </div>
                </>
            )}
            {activeTab === 'answer_votes' && (
                <>
                    <ProfileHeader
                        titleText="My Answer Votes"
                        itemCount={content.length}
                        activeTab={"answer_votes"}
                        onUpvoteClick={handleUpvoteClick}
                        onDownvoteClick={handleDownvoteClick}
                    />
                    <div className="question_list">
                        {content.map((vote) => (
                            <AnswerVotes
                                key={vote._id}
                                a={vote.referenceId}
                            />
                        ))}
                        {!content.length && <div className="no-questions">No Answer Votes Found</div>}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfileBody;