import Header from "../../src/components/main/userProfilePage/header";
import ProfileHeader from "../../src/components/main/userProfilePage/profileBody/profileBodyHeader";
import Question from "../../src/components/main/userProfilePage/profileBody/question";
import UserAnswer from "../../src/components/main/userProfilePage/profileBody/answer";
import Tag from "../../src/components/main/userProfilePage/profileBody/tag";
import QuestionVotes from "../../src/components/main/userProfilePage/profileBody/questionVotes";
import AnswerVotes from "../../src/components/main/userProfilePage/profileBody/answerVotes";
import EditQuestionForm
    from "../../src/components/main/userProfilePage/profileBody/editQuestionForm";
import EditAnswerForm from "../../src/components/main/userProfilePage/profileBody/editAnswerForm";
import ProfileBody from "../../src/components/main/userProfilePage/profileBody";

// User Profile - Header Component
describe('User Profile Page Header Component', () => {
    const profileSummary = {
        display_name: "JohnDoe",
        first_name: "John",
        last_name: "Doe",
        location: "New York",
        email: "johndoe@example.com",
        reputation: 120,
        about_me: "Developer and tech enthusiast."
    };
    it('displays all user details correctly', () => {
        cy.mount(<Header profileSummary={profileSummary} />);

        cy.get('.profileDisplayName').should('contain', profileSummary.display_name);
        cy.get('.profileDetails').within(() => {
            cy.get('.profileItem').eq(0).should('contain', `Name: ${profileSummary.first_name} ${profileSummary.last_name}`);
            cy.get('.profileItem').eq(1).should('contain', `Location: ${profileSummary.location}`);
            cy.get('.profileItem').eq(2).should('contain', `Email: ${profileSummary.email}`);
            cy.get('.profileItem').eq(3).should('contain', `Reputation: ${profileSummary.reputation}`);
        });
        cy.get('.profileRowFull .profileItemFull').should('contain', `About me: ${profileSummary.about_me}`);
    });


});

// User Profile Body - Header Component
describe('User Profile Body - Header Component', () => {
    it('displays title and item count correctly', () => {
        const titleText = "User Contributions";
        const itemCount = 5;
        cy.mount(<ProfileHeader titleText={titleText} itemCount={itemCount} activeTab="" onUpvoteClick={cy.spy()} onDownvoteClick={cy.spy()} />);
        cy.get('.profileTitle').should('contain', titleText);
        cy.get('.itemCount').should('contain', `${itemCount} items`);
    });

    it('only displays vote buttons for specific tabs', () => {
        const titleText = "Voting Record";
        const itemCount = 10;

        // Test when vote buttons should be visible
        ['question_votes', 'answer_votes'].forEach(tab => {
            cy.mount(<ProfileHeader titleText={titleText} itemCount={itemCount} activeTab={tab} onUpvoteClick={cy.spy()} onDownvoteClick={cy.spy()} />);
            cy.get('.voteButtons').should('be.visible');
            cy.get('.voteButtons button').first().should('contain', 'Upvotes');
            cy.get('.voteButtons button').last().should('contain', 'Downvotes');
        });

        // Test when vote buttons should not be visible
        cy.mount(<ProfileHeader titleText={titleText} itemCount={itemCount} activeTab="other" onUpvoteClick={cy.spy()} onDownvoteClick={cy.spy()} />);
        cy.get('.voteButtons').should('not.exist');
    });

    it('calls appropriate functions on button clicks', () => {
        const onUpvoteClick = cy.spy().as('onUpvoteClick');
        const onDownvoteClick = cy.spy().as('onDownvoteClick');
        cy.mount(<ProfileHeader titleText="Votes" itemCount={8} activeTab="question_votes" onUpvoteClick={onUpvoteClick} onDownvoteClick={onDownvoteClick} />);
        cy.get('.voteButtons button').first().click();
        cy.get('@onUpvoteClick').should('have.been.calledOnce');
        cy.get('.voteButtons button').last().click();
        cy.get('@onDownvoteClick').should('have.been.calledOnce');
    });
});

// User Profile Body - Question Component
describe('User Profile Body - Question Component', () => {
    const question = {
        _id: '1',
        title: "What is React?",
        text: "I'm learning about React. Can someone explain what it is?",
        answers: [{ text: "Answer 1" }, { text: "Answer 2" }],
        views: 150,
        vote_count: 10,
        tags: [{ name: "javascript" }, { name: "react" }],
        ask_date_time: '2020-01-01T12:00:00Z'
    };

    before(() => {
        cy.intercept('GET', '**/api/getMetaData/**', 'January 1, 2020').as('getMetaData');
    });

    it('displays all question details correctly', () => {
        cy.mount(<Question q={question} onEdit={cy.spy()} onDelete={cy.spy()} />);
        cy.get('.postStats').within(() => {
            cy.get('div').eq(0).should('contain', `${question.answers.length} answers`);
            cy.get('div').eq(1).should('contain', `${question.views} views`);
            cy.get('div').eq(2).should('contain', `${question.vote_count} votes`);
        });
        cy.get('.postTitle').should('contain', question.title);
        cy.get('.postText').should('contain', question.text);
        cy.get('.question_tags').within(() => {
            cy.get('.question_tag_button').should('have.length', question.tags.length);
        });
        cy.get('.question_meta').should('contain', 'asked Jan 01, 2020 at 07:00:00');
    });

    it('calls the onEdit and onDelete handlers correctly', () => {
        const question = {
            _id: '1',
            title: "What is React?",
            text: "Here's some text about React.",
            answers: [],
            views: 100,
            vote_count: 5,
            tags: [{ name: "javascript" }, { name: "react" }],
            ask_date_time: '2020-01-01T12:00:00Z'
        };
        const onEdit = cy.spy().as('onEditSpy');
        const onDelete = cy.spy().as('onDeleteSpy');

        cy.mount(<Question q={question} onEdit={onEdit} onDelete={onDelete} />);
        cy.get('.question_controls button').contains('Edit').click();
        cy.get('@onEditSpy').should('have.been.calledOnceWith', question);
        cy.get('.question_controls button').contains('Delete').click();
        cy.get('@onDeleteSpy').should('have.been.calledOnceWith', question._id);
    });
});

// User Profile Body - Answer Component

describe('User Profile Body - Answer Component', () => {
    const item = {
        question: {
            title: "What is Dependency Injection?",
            text: "Can someone explain what Dependency Injection is and why it's useful?",
            views: 100,
            vote_count: 5
        },
        answer: {
            _id: 'a1',
            text: "Dependency Injection is a design pattern that allows a class to receive its dependencies from another class."
        }
    };

    it('displays the question and answer details correctly', () => {
        cy.mount(<UserAnswer item={item} onEditAnswer={cy.spy()} onDeleteAnswer={cy.spy()} />);
        cy.get('.postTitle').first().should('contain', item.question.title);
        cy.get('.postText').first().should('contain', item.question.text);
        cy.get('.postStats div').first().should('contain', `${item.question.views} views`);
        cy.get('.postStats div').last().should('contain', `${item.question.vote_count} votes`);
        cy.get('#answer_postText').should('contain', item.answer.text);
    });

    it('calls onEditAnswer and onDeleteAnswer handlers correctly', () => {
        const item = {
            question: {
                title: "What is Dependency Injection?",
                text: "Explanation needed.",
                views: 100,
                vote_count: 5
            },
            answer: {
                _id: 'a1',
                text: "Dependency Injection explanation."
            }
        };
        const onEditAnswer = cy.spy().as('onEditAnswerSpy');
        const onDeleteAnswer = cy.spy().as('onDeleteAnswerSpy');

        cy.mount(<UserAnswer item={item} onEditAnswer={onEditAnswer} onDeleteAnswer={onDeleteAnswer} />);
        cy.get('#answerEditBtn').click();
        cy.get('@onEditAnswerSpy').should('have.been.calledOnceWith', item.answer);
        cy.get('#answerDeleteBtn').click();
        cy.get('@onDeleteAnswerSpy').should('have.been.calledOnceWith', item.answer._id);
    });
});

// User Profile Body - Tag Component

describe('User Profile Body - Tag Component', () => {
    it('displays the tag name and question count', () => {
        const tagData = {
            name: 'javascript',
            count: 120
        };
        cy.mount(<Tag t={tagData} />);
        cy.get('.tagNode .tagName').should('contain', tagData.name);
        cy.get('.tagNode').contains(`${tagData.count} questions`).should('exist');
    });
});

// User Profile Body - Question Vote Component

describe('User Profile Body - Question Vote Component', () => {
    const question = {
        title: "What is Dependency Injection?",
        text: "I'm trying to understand the concept of Dependency Injection. Can someone explain it?",
        views: 150,
        vote_count: 25,
        tags: [
            { name: "programming" },
            { name: "dependency-injection" }
        ]
    };

    it('displays all question details correctly', () => {
        cy.mount(<QuestionVotes q={question} />);
        cy.get('.postStats').within(() => {
            cy.get('div').eq(0).should('contain', `${question.views} views`);
            cy.get('div').eq(1).should('contain', `${question.vote_count} votes`);
        });
        cy.get('.postTitle').should('contain', question.title);
        cy.get('.postText').should('contain', question.text);
        cy.get('.question_tags').within(() => {
            cy.get('.question_tag_button').should('have.length', question.tags.length);
            question.tags.forEach((tag, index) => {
                cy.get('.question_tag_button').eq(index).should('contain', tag.name);
            });
        });
    });
});

// User Profile Body - Answer Vote Component
describe('User Profile Body - Answer Vote Component', () => {
    const answer = {
        text: "Dependency Injection is a design pattern where an object receives other objects it depends on.",
        vote_count: 15
    };

    it('displays all answer details correctly', () => {
        cy.mount(<AnswerVotes a={answer} />);
        cy.get('.postStats').should('contain', `${answer.vote_count} votes`);
        cy.get('.postText').should('contain', answer.text);
    });
});

// User Profile Body - Edit Question Component
describe('User Profile Body - Edit Question Component', () => {
    const question = {
        _id: '123',
        title: "How does React work?",
        text: "Details about React's reconciliation algorithm.",
        tags: [{name: "react"}, {name: "javascript"}]
    };

    beforeEach(() => {
        // Start by mounting the component for each test
        cy.mount(<EditQuestionForm question={question} onSave={cy.spy()} onCancel={cy.spy()} />);
    });

    it('populates form fields with initial question data', () => {
        cy.get('#formTitleInput').should('have.value', question.title);
        cy.get('#formTextInput').should('have.value', question.text);
        cy.get('#formTagInput').should('have.value', 'react javascript');
    });

    it('validates inputs and shows errors', () => {
        cy.get('#formTitleInput').clear();
        cy.get('#formTextInput').clear();
        cy.get('#formTagInput').clear();
        cy.get('.form_postBtn').contains('Save').click();
        cy.get('#formTitleInput').next('.input_error').should('contain', 'Title cannot be empty');
        cy.get('#formTextInput').next('.input_error').should('contain', 'Text cannot be empty');
        cy.get('#formTagInput').next('.input_error').should('contain', 'Must have at least 1 tag');
    });

    it('submits valid data correctly and calls onSave', () => {
        const onSave = cy.spy().as('onSaveSpy');
        cy.mount(<EditQuestionForm question={question} onSave={onSave} onCancel={cy.spy()} />);
        // Mock the API call
        cy.intercept('PUT', `**/editQuestion/${question._id}`, {
            statusCode: 200,
            body: { message: "Question updated successfully" }
        }).as('editQuestion');

        // Interact with the form
        cy.get('#formTitleInput').clear().type('Updated React Details');
        cy.get('.form_postBtn').contains('Save').click();

        // Wait for the mock request to resolve
        cy.wait('@editQuestion').its('request.body').should('deep.include', {
            title: 'Updated React Details'
        });

        // Verify onSave was called
        cy.get('@onSaveSpy').should('have.been.calledOnce');
    });


    it('calls onCancel when cancel button is clicked', () => {
        const onCancel = cy.spy().as('onCancelSpy');
        cy.mount(<EditQuestionForm question={question} onSave={cy.spy()} onCancel={onCancel} />);
        cy.get('.form_postBtn').contains('Cancel').click();
        cy.get('@onCancelSpy').should('have.been.calledOnce');
    });
});

// User Profile Body - Edit Answer Component

describe('EditAnswerForm Component', () => {
    const answer = {
        _id: '456',
        text: "Original answer text."
    };

    beforeEach(() => {
        // Mount the component before each test
        cy.mount(<EditAnswerForm answer={answer} onSave={cy.spy()} onCancel={cy.spy()} />);
    });

    it('initializes form with existing answer data', () => {
        cy.get('#formTextInput').should('have.value', answer.text);
    });

    it('validates form input and displays error message', () => {
        cy.get('#formTextInput').clear();
        cy.get('.form_postBtn').contains('Save').click();
        cy.get('.input_error').should('contain', 'Answer text cannot be empty');
    });

    it('submits updated answer and calls onSave callback', () => {
        const onSave = cy.spy().as('onSaveSpy');
        cy.mount(<EditAnswerForm answer={answer} onSave={onSave} onCancel={cy.spy()} />);
        // Mock API call for editing an answer
        cy.intercept('PUT', `**/editAnswer/${answer._id}`, {
            statusCode: 200,
            body: { message: "Answer updated successfully" }
        }).as('editAnswer');

        const updatedText = "Updated answer text.";
        cy.get('#formTextInput').clear().type(updatedText);
        cy.get('.form_postBtn').contains('Save').click();
        cy.wait('@editAnswer').its('request.body').should('deep.include', {
            text: updatedText
        });
        cy.get('@onSaveSpy').should('have.been.calledOnce');
    });

    it('calls onCancel when cancel button is clicked', () => {
        const onCancel = cy.spy().as('onCancelSpy');
        cy.mount(<EditAnswerForm answer={answer} onSave={cy.spy()} onCancel={onCancel} />);
        cy.get('.form_postBtn').contains('Cancel').click();
        cy.get('@onCancelSpy').should('have.been.calledOnce');
    });
});

// User Profile Body

describe('ProfileBody Component', () => {
    const tabs = ['questions', 'answers', 'tags', 'question_votes', 'answer_votes'];
    const mockData = {
        questions: [{ _id: '1', title: 'What is React?', text: 'A JavaScript library for building user interfaces', tags: [] }],
        answers: [{ _id: '2', text: 'Answer to What is React?' }],
        tags: [{ name: 'react', count: 10 }],
        question_votes: [
            {
                _id: "662738644824a8733c0efb70",
                referenceId: {
                    _id: "662738644824a8733c0efb50",
                    title: "Programmatically navigate using React router",
                    text: "the alert shows the proper index for the li clicked...",
                    asked_by: {
                        _id: "662738634824a8733c0efb38",
                        display_name: "betty_j"
                    },
                    ask_date_time: "2022-01-20T08:00:00.000Z",
                    views: 10,
                    tags: [
                        { _id: "662738644824a8733c0efb42", name: "react" },
                        { _id: "662738644824a8733c0efb44", name: "javascript" }
                    ],
                    vote_count: 1
                },
                voteType: "upvote",
                createdAt: "2024-04-23T04:26:12.163Z"
            }
        ],
        answer_votes: [
            {
                _id: "662738644824a8733c0efb74",
                referenceId: {
                    _id: "662738644824a8733c0efb5a",
                    text: "React Router is mostly a wrapper around the history library. history handles interaction with the browser's window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don't have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.",
                    ans_by: {
                        _id: "662738634824a8733c0efb38",
                        display_name: "betty_j"
                    },
                    ans_date_time: "2023-11-20T08:24:42.000Z",
                    vote_count: 1
                },
                voteType: "upvote",
                createdAt: "2024-04-23T04:26:12.164Z"
            }
        ]
    };
    // mocking for my-questions
    const question = {
        _id: '1',
        title: "What is React?",
        text: "I'm learning about React. Can someone explain what it is?",
        answers: [{ text: "Answer 1" }, { text: "Answer 2" }],
        views: 150,
        vote_count: 10,
        tags: [{ name: "javascript" }, { name: "react" }],
        ask_date_time: '2020-01-01T12:00:00Z'
    };
    // mocking for my-answers
    const answer = {
        _id: 'a1',
        text: "Dependency Injection is a design pattern where an object receives other objects it depends on.",
        vote_count: 15
    };

    const item = {
        question: question,
        answer: answer
    };


    beforeEach(() => {
        cy.intercept('GET', '**/my-questions', { statusCode: 200, body: [question] }).as('getUserQuestions');
        cy.intercept('GET', '**/my-answers', { statusCode: 200, body: [item] }).as('getUserAnswers');
        cy.intercept('GET', '**/my-tags', { statusCode: 200, body: [mockData.tags] }).as('getUserTags');
        // Dynamic intercept for votes based on query parameter
        cy.intercept('GET', '**/my-question-votes*', (req) => {
            let filteredVotes = mockData.question_votes;
            req.reply({
                          statusCode: 200,
                          body: filteredVotes
                      });
        }).as('getUserQuestion_votes');
        cy.intercept('GET', '**/my-answer-votes*', (req) => {
            let filteredVotes = mockData.answer_votes;
            req.reply({
                          statusCode: 200,
                          body: filteredVotes
                      });
        }).as('getUserAnswer_votes');
    });

    tabs.forEach(tab => {
        it(`renders content for the ${tab} tab correctly`, () => {
            cy.mount(<ProfileBody activeTab={tab} />);
            cy.wait(`@getUser${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
            cy.get('.profileBody').should('be.visible');
        });
    });

    // it('handles edit and delete operations for questions', () => {
    //     cy.mount(<ProfileBody activeTab="questions" />);
    //     cy.wait('@getUserQuestions');
    //     // Simulate clicking an edit button
    //     cy.get('button').contains('Edit').click();
    //     // Assuming there's a way to identify the edit form
    //     cy.get('form').should('be.visible');
    //     // Test delete functionality
    //     cy.intercept('DELETE', '**/deleteQuestion/**', { statusCode: 204 }).as('deleteQuestion');
    //     cy.get('button').contains('Delete').click();
    //     cy.wait('@deleteQuestion');
    //     cy.get('.no-questions').should('contain', 'No Questions Found');
    // });
    //
    // it('cancels editing an answer correctly', () => {
    //     cy.mount(<ProfileBody activeTab="answers" />);
    //     cy.wait('@getUserAnsweredQuestions');
    //     cy.get('button').contains('Edit').click();
    //     cy.get('button').contains('Cancel').click();
    //     cy.get('.answer_list').should('be.visible');
    // });
});





