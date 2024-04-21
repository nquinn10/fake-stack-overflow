describe('Post Moderation 1', () => {
    it('Show error page for non-admin user', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page
        cy.get("#postModerationButton").click();
        cy.contains('Oops!'); // Error message on screen if non-admin user logged in
    })
})

describe('Post Moderation 2', () => {
    it('Show flagged content for admin user', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page
        cy.get("#postModerationButton").click();
        cy.contains('Flagged Questions'); // If admin user logged in, flagged content will be shown to review
        cy.contains('Flagged Answers');
    })
})

describe('Post Moderation 3', () => {
    it('Shows the reset and delete buttons', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page
        cy.get("#postModerationButton").click();
        cy.get("#resetBtnQ").click(); // if you click the reset button, question removed from flagged content (reverses flag, sets vote count to 0)
        cy.contains("No flagged questions to review");
        cy.get("#deleteBtnA").click(); // if you click the delete button, question removed from website
        cy.contains("No flagged answers to review.");
    })
})

