describe('Edit Delete Answer Tests', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
    });
    
    afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
    });

    it('User can successfully edit an answer they asked', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); 
        cy.get("#userProfileButton").click();
        cy.contains("My Questions").click();
        cy.get(".profileContent").find("#menu_answer").click(); // navigate to user's answers
        cy.get("#answerEditBtn").click();
        cy.get("#formTextInput").clear().type("Test update answer");
        cy.contains("Save").click();
        cy.get("#answer_postText").contains("Test update answer");
    })

    it('Show error if answer text left empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); 
        cy.get("#userProfileButton").click();
        cy.contains("My Questions").click();
        cy.get(".profileContent").find("#menu_answer").click(); 
        cy.get("#answerEditBtn").click();
        cy.get("#formTextInput").clear();
        cy.contains("Save").click();
        cy.contains("Answer text cannot be empty");
    })

    it('Successfully allows user to delete their answer', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); 
        cy.get("#userProfileButton").click();
        cy.contains("My Questions").click();
        cy.get(".profileContent").find("#menu_answer").click(); 
        cy.contains("5 items"); // user contributed 5 answers 
        cy.get("#answerDeleteBtn").click();
        cy.contains("4 items"); // after deleting answer, total answers decreases by 1
       
    })

})