describe('Edit Delete Question Tests', () => {

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

})