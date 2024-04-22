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

})