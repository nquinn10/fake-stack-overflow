describe('User Login', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
      });
    
      afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
      });

    it('Show error message if user not found', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('nobody@nomail.com');
        cy.get('#loginPasswordInput').type('123');
        cy.get('#loginButton').click();
        cy.contains('User not found. Please register');
    })

    it('Show error message if user found but has wrong credentials', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('WRONGPASSWORD');
        cy.get('#loginButton').click();
        cy.contains('Invalid password. Please try again.');
    })

    it("Successfully logs in existing user with existing credentials", () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains("All Questions"); // navigate to home page after successful login 
    })

    it("Shows error if email left empty", () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('Email cannot be empty');
    })

    it("Shows error if password left empty", () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginButton').click();
        cy.contains('Password cannot be empty');
    })

    it('Successfully logs user out', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains("All Questions"); // successfully logs user in
        cy.get("#logoutButton").click(); // click log out button
        cy.contains("All Questions"); // stays on home page
        cy.contains("Ask a Question").click(); // won't let user ask question after they log out, should prompt them to sign back in
        cy.contains("Email*"); // log in form prompt means they were successfully logged out
    })

})