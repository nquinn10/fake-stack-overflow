
describe('Vote Test 1', () => {
    
    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
      });
    
      afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
      });
    

    it('Vote unsuccessful if no user logged in', () => {
        cy.visit('http://localhost:3000');
        cy.contains('All Questions'); // Confirms that it's on the home page
        cy.contains('Best pizza in Boston?').click();

        // Capture initial vote count
        cy.get('#vote_count').invoke('text').then((initialVoteCount) => {
            cy.get("#downVoteQ").click(); // Attempt to vote

            // Check vote count again after clicking
            cy.get('#vote_count').invoke('text').should((newVoteCount) => {
                expect(newVoteCount).to.eq(initialVoteCount); // Ensure vote count has not changed
            });
        });
    });


    it('Vote unsuccessful if user with insufficient reputation points logged in', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // Confirms that it's on the home page
        cy.contains('Best pizza in Boston?').click();

        // Capture initial vote count
        cy.get('#vote_count').invoke('text').then((initialVoteCount) => {
            cy.get("#downVoteQ").click(); // Attempt to vote

            // Check vote count again after clicking
            cy.get('#vote_count').invoke('text').should((newVoteCount) => {
                expect(newVoteCount).to.eq(initialVoteCount); // Ensure vote count has not changed
            });
        });
    });


    it('Vote successful if user with sufficient reputation', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // Confirms that it's on the home page
        cy.contains('Best pizza in Boston?').click();

        // Capture initial vote count
        cy.get('#vote_count').invoke('text').then((initialVoteCount) => {
            const initialCount = parseInt(initialVoteCount);
            cy.get("#downVoteQ").click(); // Attempt to vote

            // Check vote count again after clicking
            cy.get('#vote_count').contains("-17");// Ensure vote count decremented by 1
            });
        });


    it('User cannot cast same vote twice', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // Confirms that it's on the home page
        cy.contains('Best pizza in Boston?').click();

        // Capture initial vote count
        cy.get('#vote_count').invoke('text').then((initialVoteCount) => {
            cy.get("#downVoteQ").click(); // Attempt to vote
            const newVoteCount = parseInt(initialVoteCount) - 1;
            // Check vote count again after clicking
            cy.get('#vote_count').contains(newVoteCount);// Ensure not decremented again!
            });
        });


    it('User can cast opposite vote as before, changing vote count by +/- 2', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // Confirms that it's on the home page
        cy.contains('Best pizza in Boston?').click();

        // Capture initial vote count
        cy.get('#vote_count').invoke('text').then((initialVoteCount) => {
            cy.get("#upVoteQ").click(); // Attempt to vote

            // Check vote count again after clicking
            cy.get('#vote_count').contains("-15");// Turns down vote into upvote, changing vote count by |2|
            });
        });

    it('Successful vote on answer', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // Confirms that it's on the home page
        cy.contains('Quick question about storage on android').click();
        
         // Capture initial vote count
        cy.get('#vote_countA').invoke('text').then((initialVoteCount) => {
            const initialCount = parseInt(initialVoteCount);
            cy.get("#downVoteA").click(); // Attempt to vote

            // Check vote count again after clicking
            cy.get('#vote_countA').contains("-6");// Turns down vote into upvote, changing vote count by |2|
            });
        });
 });


