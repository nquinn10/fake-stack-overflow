import Header from "../../src/components/main/userProfilePage/header";
import ProfileHeader from "../../src/components/main/userProfilePage/profileBody/profileBodyHeader";
import Question from "../../src/components/main/userProfilePage/profileBody/question";

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




