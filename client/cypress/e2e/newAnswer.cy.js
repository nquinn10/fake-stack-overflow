describe('New Answer Page 1', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
    });
    
    afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
    });

    it('Does not show the new answer form if user not logged in', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Programmatically navigate using React router').click();
        cy.contains('Answer Question').click();
        // user prompted to log in, not shown new answer form
        cy.contains("Email*");
    });

    // need to log in for remaining tests
    it('Create new answer should be displayed at the top of the answers page', () => {
        const answers = ["Test Answer 1", "React Router is mostly a wrapper around the history library. history handles interaction with the browser's window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don't have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.", "On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn't change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.",
                         "On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router."];
        cy.visit('http://localhost:3000');
        cy.contains('Login').click(); // need to log in before each remaining test
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // Confirms that it's on the home page

        cy.contains('Programmatically navigate using React router').click();
        cy.contains('Answer Question').click();
        cy.get('#answerTextInput').type(answers[0]);
        cy.contains('Post Answer').click();
        cy.get('.answerText').each(($el, index) => {
            cy.wrap($el).should('contain', answers[index]);
        });
        cy.contains('johnny_d');
        cy.contains('0 seconds ago');
    });


    it('Answer is mandatory when creating a new answer', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click(); // need to log in before each remaining test
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // Confirms that it's on the home page
        cy.contains('Programmatically navigate using React router').click();
        cy.contains('Answer Question').click();
        cy.contains('Post Answer').click();
        cy.contains('Answer text cannot be empty');
    });


    it('successfully displays the answer textbox for the new answer page', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click(); // need to log in before each remaining test
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('Programmatically navigate using React router').click();
        cy.contains('Answer Question').click();
        cy.get('#answerTextInput').should('exist');
    });

    it('Create new answer should increase the count of the answers on question page', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click(); // need to log in before each remaining test
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('Programmatically navigate using React router').click();
        cy.contains('2 answers');
        cy.contains('Answer Question').click();
        cy.get('#answerTextInput').type("Test Answer 1");
        cy.contains('Post Answer').click();
        cy.contains('3 answers');
    });
});