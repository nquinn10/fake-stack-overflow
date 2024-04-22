describe('User Registration', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
      });
    
      afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
      });

    it('Show error message if existing user tries to register', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Register').click();
        cy.get('#email').type('betty@yahoo.com');
        cy.get('#password').type("NEWPASSWORD");
        cy.get("#firstName").type("Betty");
        cy.get("#lastName").type("Jones");
        cy.get("#displayName").type("Betty_new");
        cy.get("#aboutMe").type("#LookingForWork");
        cy.get("#location").type("Boston");
        cy.get("#registerButton").click();
        cy.contains("User already exists. Please log in");
    })

    it('Show error message if email empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Register').click();
        cy.get('#password').type("NEWPASSWORD");
        cy.get("#firstName").type("Stevie");
        cy.get("#lastName").type("Johnson");
        cy.get("#displayName").type("stevie_codes");
        cy.get("#aboutMe").type("I code!");
        cy.get("#location").type("New York");
        cy.get("#registerButton").click();
        cy.contains("Email cannot be empty");
    })

    it('Show error message if password empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Register').click();
        cy.get('#email').type("stevie@email.com");
        cy.get("#firstName").type("Stevie");
        cy.get("#lastName").type("Johnson");
        cy.get("#displayName").type("stevie_codes");
        cy.get("#aboutMe").type("I code!");
        cy.get("#location").type("New York");
        cy.get("#registerButton").click();
        cy.contains("Password cannot be empty");
    })

    it('Show error message if first name empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Register').click();
        cy.get('#email').type("stevie@email.com");
        cy.get("#password").type("NEWPASSWORD")
        cy.get("#lastName").type("Johnson");
        cy.get("#displayName").type("stevie_codes");
        cy.get("#aboutMe").type("I code!");
        cy.get("#location").type("New York");
        cy.get("#registerButton").click();
        cy.contains("First name cannot be empty");
    })

    it('Show error message if last name empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Register').click();
        cy.get('#email').type("stevie@email.com");
        cy.get("#password").type("NEWPASSWORD")
        cy.get("#firstName").type("Stevie");
        cy.get("#displayName").type("stevie_codes");
        cy.get("#aboutMe").type("I code!");
        cy.get("#location").type("New York");
        cy.get("#registerButton").click();
        cy.contains("Last name cannot be empty");
    })

    it('Show error message if display name empty', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Register').click();
        cy.get('#email').type("stevie@email.com");
        cy.get("#password").type("NEWPASSWORD")
        cy.get("#firstName").type("Stevie");
        cy.get("#lastName").type("Johnson");
        cy.get("#aboutMe").type("I code!");
        cy.get("#location").type("New York");
        cy.get("#registerButton").click();
        cy.contains('Display name cannot be empty');
    })

    it("Successfully registers new user", () => {
        cy.visit('http://localhost:3000');
        cy.contains('Register').click();
        cy.get('#email').type("stevie@email.com");
        cy.get("#password").type("NEWPASSWORD")
        cy.get("#firstName").type("Stevie");
        cy.get("#lastName").type("Johnson");
        cy.get("#displayName").type("stevie_codes");
        cy.get("#aboutMe").type("I code!");
        cy.get("#location").type("NYC");
        cy.get("#registerButton").click();
        cy.contains('All Questions'); // navigates to home page upon successful registration
    })

})