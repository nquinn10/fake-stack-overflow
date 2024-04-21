describe('Answer Page 1', () => {
    it('Answer Page displays expected header', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Programmatically navigate using React router').click();
        cy.get('#answersHeader').should('contain', 'Programmatically navigate using React router');
        cy.get('#answersHeader').should('contain', '2 answers');
        cy.get('#answersHeader').should('contain', 'Ask a Question');
        cy.get('#sideBarNav').should('contain', 'Questions');
        cy.get('#sideBarNav').should('contain', 'Tags');
    })
})

describe('Answer Page 2', () => {
    it('Answer Page displays expected question text', () => {
        const text = "Not technical but maybe someone has a good rec";
        cy.visit('http://localhost:3000');
        cy.contains('Best pizza in Boston?').click();
        cy.get('#questionBody').should('contain', '-16'); // added vote count
        cy.get('.answer_question_text').should('contain', text);
        cy.get('#questionBody').should('contain', 'johnny_d');
        cy.get('#questionBody').should('contain', 'Apr 14, 2023');
        cy.get('#questionBody').should('contain', '21:17');
    })
})

describe('Answer Page 3', () => {
    it('Answer Page displays expected answers', () => {
        const answers = ["React Router is mostly a wrapper around the history library. history handles interaction with the browser's window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don't have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.", "On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn't change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router."];
        cy.visit('http://localhost:3000');
        cy.contains('Programmatically navigate using React router').click();
        cy.get('.answerText').each(($el, index) => {
            cy.wrap($el).should('contain', answers[index]);
        });
    });
});

describe('Answer Page 4', () => {
    it('Answer Page displays expected authors', () => {
        const authors = ['betty_j', 'sammysmith'];
        const date = ['Nov 20','Nov 23'];
        const times = ['03:24','08:24'];
        cy.visit('http://localhost:3000');
        cy.contains('Programmatically navigate using React router').click();
        cy.get('.answerAuthor').each(($el, index) => {
            cy.wrap($el).should('contain', authors[index]);
            cy.wrap($el).should('contain', date[index]);
            cy.wrap($el).should('contain', times[index]);
        });
    });
});