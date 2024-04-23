describe('Delete Question/Answer Tests', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
    });
    
    afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
    });


    it('User can successfully delete a question they asked', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); 

        cy.get("#userProfileButton").click();

        cy.contains("My Questions").click();
        cy.get(".profileBody").contains("Delete").click();
        cy.get(".profileHeader").contains("My Questions");
        cy.get(".profileHeader").contains("1 items"); // 1 question fewer after deletion
    })
    
    it('User tags should change if question deleted', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); 

        cy.get("#userProfileButton").click();
        // see tags before delete question
        cy.get("#userProfileButton").click();
        cy.get(".profileContent").find("#menu_tag").click();
        cy.get(".profileTitle").contains("My Tags");
        cy.get(".itemCount").contains("4 items");
        cy.get(".profileContent").find("#menu_question").click();
        cy.contains("My Questions").click();
        cy.get(".profileBody").contains("Delete").click();
        cy.get(".profileHeader").contains("My Questions");
        cy.get(".profileHeader").contains("1 items"); // 1 question fewer after deletion
        cy.get(".profileContent").find("#menu_tag").click();
        cy.get(".itemCount").contains("3 items"); // 1 fewer tag
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