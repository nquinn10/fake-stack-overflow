describe('Edit Question/Answer Tests', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
    });
    
    afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
    });

    it('User can successfully edit a question they asked', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); 

        cy.get("#userProfileButton").click();

        cy.contains("My Questions").click();
        cy.get(".profileBody").contains("Edit").click();
        cy.get("#formTextInput").clear().type("The alert shows the proper index for the li clicked, and when I alert the variable within the last function Im calling, moveToNextImage(stepClicked), the same value shows but the animation isnt happening. I appreciate the help! Thank you!");
        cy.get("#formTagInput").type(" node"); // add tag
        cy.contains("Save").click();

        cy.get(".question_tags").contains("node"); // updated tag list for question after edited
    })

    it('Show error message if question title left empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); 
        cy.get("#userProfileButton").click();
        cy.contains("My Questions").click();
        cy.get(".profileBody").contains("Edit").click();

        cy.get("#formTitleInput").clear();
        cy.get("#formTextInput").clear().type("Test edits");
        cy.contains("Save").click();
        cy.contains("Title cannot be empty");
    })

    it('Show error message if question text left empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); 
        cy.get("#userProfileButton").click();
        cy.contains("My Questions").click();
        cy.get(".profileBody").contains("Edit").click();

        cy.get("#formTextInput").clear();
        cy.contains("Save").click();
        cy.contains("Text cannot be empty");
    })

    it('Show error message if question tags left empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); 
        cy.get("#userProfileButton").click();
        cy.contains("My Questions").click();
        cy.get(".profileBody").contains("Edit").click();

        cy.get("#formTagInput").clear();
        cy.contains("Save").click();
        cy.contains("Must have at least 1 tag");
    })

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



})