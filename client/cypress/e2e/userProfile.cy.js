describe('User Profile Tests', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
    });
    
    afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
    });

    it('If user not logged in, no user profile button shown', () => {
        cy.visit('http://localhost:3000');
        cy.contains("All Questions"); // navigated to homepage
        cy.get("#userProfileButton").should('not.exist'); // no user profile button visible if not logged in
    })

    it('User profile button navigates logged in user to their profile', () => {
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
    })

    it('Displays all questions asked by the logged in user', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        const titles = ["Programmatically navigate using React router", "android studio save string shared preference, start activity and load the saved string"];
        cy.get("#userProfileButton").click();
        cy.get(".profileHeader").contains("My Questions");
        cy.get(".profileHeader").contains("2 items");
        cy.get('.postTitle').each(($el, index, $list) => {
            cy.wrap($el).should('contain', titles[index]);
        });
    })

    it('Displays all answers contributed by logged in user', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        const texts = ["React Router is mostly a wrapper around the history library. history handles interaction with the browser's window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don't have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.",
                        "Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.",
                        "YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);",
                        "Storing content as BLOBs in databases.",
                        "Using GridFS to chunk and store content."];
        cy.get("#userProfileButton").click();
        cy.get('#menu_answer').click(); // navigate to user answers
        cy.get(".profileTitle").contains("My Answers");
        cy.get(".itemCount").contains("5 items");
        cy.get('#answer_postText').each(($el, index, $list) => {
            cy.wrap($el).should('contain', texts[index]);
        });
    })

    it('Displays all tags logged in user participates in', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        const votes = [];
        cy.get("#userProfileButton").click();
        cy.get(".profileContent").find("#menu_tag").click();
        cy.get(".profileTitle").contains("My Tags");
        cy.get(".itemCount").contains("4 items");
    })

    it('Displays all votes cast on questions', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('dd@email.com');
        cy.get('#loginPasswordInput').type('TEST1234');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        const votes = ["Programmatically navigate using React router", "android studio save string shared preference, start activity and load the saved string"];
        cy.get("#userProfileButton").click();
        cy.get(".profileContent").find("#menu_question_vote").click();
        cy.get('.postTitle').each(($el, index, $list) => {
            cy.wrap($el).should('contain', votes[index]);
        });
    })


    it('Displays all votes cast on answers', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('dd@email.com');
        cy.get('#loginPasswordInput').type('TEST1234');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        const votes = ["React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.", "On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router."];
        cy.get("#userProfileButton").click();
        cy.get(".profileContent").find("#menu_answer_vote").click();
        cy.get('.postText').each(($el, index, $list) => {
            cy.wrap($el).should('contain', votes[index]);
        });
    })

    it('Shows edit profile button', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('dd@email.com');
        cy.get('#loginPasswordInput').type('TEST1234');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page
        cy.get("#userProfileButton").click();
        cy.contains("Edit Profile").click();
    })

    it('Logged in user creates new question, it shows up on their profile', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // should take you to home page

        // ask new question
        cy.contains("Ask a Question").click();
        cy.get('#formTitleInput').type('Test Question 1');
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('javascript');
        cy.contains('Post Question').click();
        cy.contains('Fake Stack Overflow');

        // show new question in user's profile page
        cy.get("#userProfileButton").click();
        cy.get(".profileHeader").contains("My Questions");
        cy.get(".profileHeader").contains("3 items"); // was 2, now 3
        cy.get('.postTitle').contains("Test Question 1");
        cy.get('.postText').contains("Test Question 1 Text");
    })

    it("Increments a user's reputation score if their content gets upvoted", () => {
        // log in with Betty, check reputation score
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.get("#userProfileButton").click();
        cy.contains("Reputation: 15"); 
        // log out
        cy.get("#logoutButton").click();
        
        // log in with Sammy, upvote betty's question
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('sammy@email.com');
        cy.get('#loginPasswordInput').type('GHJK543');
        cy.get('#loginButton').click();
        // upvote question asked by betty_j
        cy.contains("android studio save string shared preference, start activity and load the saved string").click();
        cy.get("#upVoteQ").click();
        // log out
        cy.get("#logoutButton").click();
        cy.wait(3000); // wait for DB 

        // log in with Betty, show increase in reputation score
        cy.contains('Login').click();
        cy.wait(3000); // wait for database
        cy.get('#loginEmailInput').type('betty@yahoo.com');
        cy.get('#loginPasswordInput').type('ABCD876');
        cy.get('#loginButton').click();
        cy.get("#userProfileButton").click();
        cy.contains("Reputation: 25");
    })


});