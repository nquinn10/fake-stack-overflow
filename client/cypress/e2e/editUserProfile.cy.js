describe('Edit User Profile Tests', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
    });
    
    afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
    });

    it('User can successfully change their personal information', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        cy.get("#userProfileButton").click();
        cy.contains("Name: Betty Jones"); // user information shown at top of screen
        cy.contains("Email: betty@yahoo.com");
        cy.contains("About me:");
        cy.contains("Location:");
        cy.contains("Reputation: 15"); 

        cy.contains("Edit Profile").click();

        cy.get("#displayName").clear().type("betty_jones");
        cy.get("#aboutMe").type("MSCS candidate");
        cy.get("#location").type("Boston");
        cy.contains("Save").click();

        cy.contains("About me: MSCS candidate");
        cy.contains("Location: Boston");
    })

    it('Show error message if first name empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        cy.get("#userProfileButton").click();
        cy.contains("Edit Profile").click();

        cy.get("#firstName").clear(); // clear first name but don't replace
        cy.get("#displayName").type("betty_jones");
        cy.get("#aboutMe").type("MSCS candidate");
        cy.get("#location").type("Boston");
        cy.contains("Save").click();
        cy.contains("First name cannot be empty");
    })

    it('Show error message if last name empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        cy.get("#userProfileButton").click();
        cy.contains("Edit Profile").click();

        cy.get("#lastName").clear(); // clear last name but don't replace
        cy.get("#displayName").type("betty_jones");
        cy.get("#aboutMe").type("MSCS candidate");
        cy.get("#location").type("Boston");
        cy.contains("Save").click();
        cy.contains("Last name cannot be empty");
    })

    it('Show error message if display name empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        cy.get("#userProfileButton").click();
        cy.contains("Edit Profile").click();

        cy.get("#displayName").clear(); // clear display name but don't replace
        cy.get("#aboutMe").type("MSCS candidate");
        cy.get("#location").type("Boston");
        cy.contains("Save").click();
        cy.contains("Display name cannot be empty");
    })
})