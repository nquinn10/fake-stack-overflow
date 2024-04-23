import PostModHeader from "../../src/components/main/postMod/header";
import FlaggedQuestions from "../../src/components/main/postMod/questions";
import FlaggedAnswers from "../../src/components/main/postMod/answers";
import PostModerationPage from "../../src/components/main/postMod";


// Post Moderation - Header Component
it('displays the provided title', () => {
    const title = 'Post Moderation';
    cy.mount(<PostModHeader title={title} />);
    cy.get('#postModHeader .bold_title').first().should('contain', title);
});

it('conditionally displays question and answer counts', () => {
    const title = 'Post Moderation';
    const qCount = 5;
    const ansCount = 3;

    // Test with both counts provided
    cy.mount(<PostModHeader title={title} qCount={qCount} ansCount={ansCount} />);
    cy.get('.bold_title').eq(1).should('contain', `${qCount} flagged questions`);
    cy.get('.bold_title').eq(2).should('contain', `${ansCount} flagged answers`);

    // Test with only question count provided
    cy.mount(<PostModHeader title={title} qCount={qCount} />);
    cy.get('.bold_title').eq(1).should('contain', `${qCount} flagged questions`);
    cy.get('.bold_title').should('not.contain', 'flagged answers');

    // Test with only answer count provided
    cy.mount(<PostModHeader title={title} ansCount={ansCount} />);
    cy.get('.bold_title').eq(1).should('contain', `${ansCount} flagged answers`);
    cy.get('.bold_title').should('not.contain', 'flagged questions');

    // Test with neither count provided
    cy.mount(<PostModHeader title={title} />);
    cy.get('.bold_title').should('have.length', 1);
});

// Post Moderation - Questions Component

it('displays the question data', () => {
    const question = {
        _id: '1',
        title: 'What is Cypress?',
        text: 'Can someone explain what Cypress is used for in testing?',
        vote_count: 5
    };
    cy.mount(<FlaggedQuestions question={question} onReset={cy.spy()} onDelete={cy.spy()} />);
    cy.get('.qTitle').should('contain', question.title);
    cy.get('.qText').should('contain', question.text);
    cy.get('.qVote').should('contain', `${question.vote_count} votes`);
});

it('calls onReset with the question ID', () => {
    const question = {
        _id: '1',
        title: 'What is Cypress?',
        text: 'Can someone explain what Cypress is used for in testing?',
        vote_count: 5
    };
    const onReset = cy.spy().as('onResetSpy');
    cy.mount(<FlaggedQuestions question={question} onReset={onReset} onDelete={cy.spy()} />);
    cy.get('#resetBtnQ').click();
    cy.get('@onResetSpy').should('have.been.calledOnceWith', question._id);
});

it('calls onDelete with the question ID', () => {
    const question = {
        _id: '1',
        title: 'What is Cypress?',
        text: 'Can someone explain what Cypress is used for in testing?',
        vote_count: 5
    };
    const onDelete = cy.spy().as('onDeleteSpy');
    cy.mount(<FlaggedQuestions question={question} onReset={cy.spy()} onDelete={onDelete} />);
    cy.get('#deleteBtnQ').click();
    cy.get('@onDeleteSpy').should('have.been.calledOnceWith', question._id);
});

// Post Moderation - Answers Component

    it('displays the answer data', () => {
        const answer = {
            _id: '2',
            text: 'Cypress is a front-end testing tool built for the modern web.',
            vote_count: 3
        };
        cy.mount(<FlaggedAnswers answer={answer} onReset={cy.spy()} onDelete={cy.spy()} />);
        cy.get('.aText').should('contain', answer.text);
        cy.get('.aVote').should('contain', `${answer.vote_count} votes`);
    });


it('calls onReset with the answer ID', () => {
    const answer = {
        _id: '2',
        text: 'Cypress is a front-end testing tool built for the modern web.',
        vote_count: 3
    };
    const onReset = cy.spy().as('onResetSpy');
    cy.mount(<FlaggedAnswers answer={answer} onReset={onReset} onDelete={cy.spy()} />);
    cy.get('#resetBtnA').click();
    cy.get('@onResetSpy').should('have.been.calledOnceWith', answer._id);
});

it('calls onDelete with the answer ID', () => {
    const answer = {
        _id: '2',
        text: 'Cypress is a front-end testing tool built for the modern web.',
        vote_count: 3
    };
    const onDelete = cy.spy().as('onDeleteSpy');
    cy.mount(<FlaggedAnswers answer={answer} onReset={cy.spy()} onDelete={onDelete} />);
    cy.get('#deleteBtnA').click();
    cy.get('@onDeleteSpy').should('have.been.calledOnceWith', answer._id);
});

// Post Moderation - Main Component

    beforeEach(() => {
        cy.intercept('GET', '**/flaggedQuestions', {
            statusCode: 200,
            body: [{ _id: '1', title: 'Invalid Post?', text: 'This seems inappropriate.', vote_count: -17 }]
        }).as('getFlaggedQuestions');

        cy.intercept('GET', '**/flaggedAnswers', {
            statusCode: 200,
            body: [{ _id: '2', text: 'I disagree completely.', vote_count: -20 }]
        }).as('getFlaggedAnswers');
    });

    it('loads and displays flagged questions and answers', () => {
        cy.mount(<PostModerationPage />);
        cy.wait(['@getFlaggedQuestions', '@getFlaggedAnswers']);
        cy.get('.flaggedQs').should('have.length', 1);
        cy.get('.flaggedAs').should('have.length', 1);
    });

it('displays no flagged content message when there are no flagged questions or answers', () => {
    cy.intercept('GET', '**/flaggedQuestions', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/flaggedAnswers', { statusCode: 200, body: [] });
    cy.mount(<PostModerationPage />);
    cy.contains('No flagged questions to review.');
    cy.contains('No flagged answers to review.');
});

it('displays an error message when user is not an admin', () => {
    cy.intercept('GET', '**/flaggedQuestions', { statusCode: 500, body: { message: 'Error fetching data' } });
    cy.mount(<PostModerationPage />);
    cy.contains("Oops! You don't have access to this page.");
});

it('removes a question from the list when delete is successful', () => {
    const questions = [{ _id: '1', title: 'Invalid Post?', text: 'This seems inappropriate.', vote_count: -17 }];
    cy.intercept('GET', '**/flaggedQuestions', { statusCode: 200, body: questions });
    cy.intercept('DELETE', '**/deleteQuestion/*', { statusCode: 200 });
    cy.mount(<PostModerationPage />);
    cy.get('#deleteBtnQ').click();
    cy.get('.flaggedQs').should('not.exist');
});

it('removes an answer from the list when delete is successful', () => {
    const answers = [{ _id: '2', text: 'I disagree completely.', vote_count: -20 }];
    cy.intercept('GET', '**/flaggedAnswers', { statusCode: 200, body: answers });
    cy.intercept('DELETE', '**/deleteAnswer/*', { statusCode: 200 });
    cy.mount(<PostModerationPage />);
    cy.get('#deleteBtnA').click();
    cy.get('.flaggedAs').should('not.exist');
});
