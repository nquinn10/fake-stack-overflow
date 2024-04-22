describe('New Question Form', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
    });
    
    afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
    });

    it('Does not show the new question form if user not logged in', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Ask a Question').click();
        // user prompted to login if not alread
        cy.contains("Email*"); 
    });

    // once logged in:
    it('Ask a Question creates and displays in All Questions', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click(); // need to log in before each remaining test
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions'); // Confirms that it's on the home page
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question 1');
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('javascript');
        cy.contains('Post Question').click();
        cy.contains('Fake Stack Overflow');
        const qTitles = ['Test Question 1', 'Best pizza in Boston?', 'Quick question about storage on android', 'Object storage for a web application','android studio save string shared preference, start activity and load the saved string', 'Programmatically navigate using React router'];
        cy.get('.postTitle').each(($el, index, $list) => {
            cy.wrap($el).should('contain', qTitles[index]);
        });
    })


    it('Ask a Question creates and displays expected meta data', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question 1');
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('javascript');
        cy.contains('Post Question').click();
        cy.contains('Fake Stack Overflow');
        cy.contains('6 questions');
        cy.contains('johnny_d asked 0 seconds ago');
        const answers = ['0 answers', '0 answers','2 answers', '2 answers', '3 answers', '2 answers'];
        const views = ['0 views', '20 views', '103 views','200 views', '121 views', '10 views'];
        const votes = ['0 votes', '-16 votes', '0 votes', '0 votes', '-1 votes', '1 votes'];
        cy.get('.postStats').each(($el, index, $list) => {
            cy.wrap($el).should('contain', answers[index]);
            cy.wrap($el).should('contain', views[index]);
            cy.wrap($el).should('contain', votes[index]);
        });
        cy.contains('Unanswered').click();
        cy.get('.postTitle').should('have.length', 2);
        cy.contains('2 questions');
    })


    it('Ask a Question creates and displays in All Questions with necessary tags', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question 1');
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('javascript t1 t2');
        cy.contains('Post Question').click();
        cy.contains('Fake Stack Overflow');
        cy.contains('javascript');
        cy.contains('t1');
        cy.contains('t2');
    })


    it('Ask a Question creates and displays in All Questions with necessary tags', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question 1');
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('javascript t1 t2');
        cy.contains('Post Question').click();
        cy.contains('Fake Stack Overflow');
        cy.contains('javascript');
        cy.contains('android-studio');
        cy.contains('t2');
    })


    it('Ask a Question with empty title shows error', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        cy.contains('Ask a Question').click();
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('javascript');
        cy.contains('Post Question').click();
        cy.contains('Title cannot be empty');
    })


    it('Ask a Question with long title shows error', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question 0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789');
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('javascript');
        cy.contains('Post Question').click();
        cy.contains('Title cannot be more than 100 characters');
    })


    it('Ask a Question with empty text shows error', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question 1');
        cy.get('#formTagInput').type('javascript');
        cy.contains('Post Question').click();
        cy.contains('Question text cannot be empty');
    })


    it('Ask a Question with more than 5 tags shows error', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question 1');
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('t1 t2 t3 t4 t5 t6');
        cy.contains('Post Question').click();
        cy.contains('Cannot have more than 5 tags');
    })


    it('Ask a Question with a long new tag', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question 1');
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('t1 t2 t3t4t5t6t7t8t9t3t4t5t6t7t8t9');
        cy.contains('Post Question').click();
        cy.contains('New tag length cannot be more than 20');
    })


    it('create a new question with a new tag and finds the question through tag', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        
        // add a question with tags
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question A');
        cy.get('#formTextInput').type('Test Question A Text');
        cy.get('#formTagInput').type('test1-tag1 react');
        cy.contains('Post Question').click();

        // clicks tags
        cy.contains('Tags').click();
        cy.contains('test1-tag1').click();
        cy.contains('1 questions');
        cy.contains('Test Question A');

        cy.contains('Tags').click();
        cy.contains('react').click();
        cy.contains('2 questions');
        cy.contains('Test Question A');
        cy.contains('Programmatically navigate using React router');
    });


    it('Ask a Question creates and accepts only 1 tag for all the repeated tags', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();
        cy.get('#loginEmailInput').type('john@email.com');
        cy.get('#loginPasswordInput').type('WXYZ123');
        cy.get('#loginButton').click();
        cy.contains('All Questions');
        cy.contains('Tags').click();
        cy.contains('7 Tags');
        cy.contains('Ask a Question').click();
        cy.get('#formTitleInput').type('Test Question 1');
        cy.get('#formTextInput').type('Test Question 1 Text');
        cy.get('#formTagInput').type('test-tag test-tag test-tag');
        cy.contains('Post Question').click();
        cy.contains('test-tag').should('have.length',1);
        cy.contains('Tags').click();
        cy.contains('8 Tags');
        cy.contains('test-tag').click();
        cy.contains('1 questions');
    });
});