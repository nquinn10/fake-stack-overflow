describe('Post Moderation Tests', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
    });
    
    afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
    });

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


    it('Shows the reset and delete buttons', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page
        cy.get("#postModerationButton").click();
        cy.contains("Reset");
        cy.contains("Delete");
    })

    it('Resets answer vote count to 0 if reset button clicked', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page
        cy.get("#postModerationButton").click();
        cy.contains("Best pizza in Boston?");
        cy.contains("-16 votes");
        cy.get("#resetBtnQ").click(); // if you click the reset button, question removed from flagged content (reverses flag, sets vote count to 0)
        cy.contains("No flagged questions to review");
        cy.get("#menu_question").click();
        cy.contains("All Questions");
        cy.contains("Best pizza in Boston?").click();
        cy.contains('0'); // vote count reset to 0 to reverse flag
    })

    it("Deletes answer from database and decrements answer count on question", () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page
        cy.contains("Quick question about storage on android").click();
        cy.contains("2 answers");  // before question deleted
        cy.get("#postModerationButton").click();
        cy.contains("Blah blah blah blah blah");
        cy.contains("-15 votes");
        cy.get("#deleteBtnA").click(); // if you click the delete button, answer removed from DB
        cy.contains("No flagged answers to review");
        cy.get("#menu_question").click();
        cy.contains("Quick question about storage on android").click();
        cy.contains("1 answers"); // question deleted
    })
})

