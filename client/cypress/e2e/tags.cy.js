describe('All Tags 1', () => {

    beforeEach(() => {
        // Seed the database before each test
        cy.exec("node ../server/init.js");
      });
    
      afterEach(() => {
        // Clear the database after each test
        cy.exec("node ../server/destroy.js");
      });

    it('Total Tag Count', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Tags').click();
        cy.contains('All Tags');
        cy.contains('7 Tags'); // test data has 7 tags upon init
        cy.contains('Ask a Question');
    })



    it('Tag names and count', () => {
        const tagNames = ['react', 'javascript', 'android-studio', 'shared-preferences', 'storage', 'website', 'flutter'];
        const tagCounts = ['1 questions', '2 questions', '2 questions', '2 questions', '2 questions', '1 questions', '1 questions'];
        cy.visit('http://localhost:3000');
        cy.contains('Tags').click();
        cy.get('.tagNode').each(($el, index, $list) => {
            cy.wrap($el).should('contain', tagNames[index]);
            cy.wrap($el).should('contain', tagCounts[index]);
        })
    })



    it('Click Tag Name', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Tags').click();
        cy.contains('react').click();
        cy.contains('Programmatically navigate using React router');
        cy.contains('2 answers');
        cy.contains('10 views'); // upon initialization of DB, has 10 views
        cy.contains('1 votes'); // add check for number of votes in question postStats
        cy.contains('betty_j');
        cy.contains('Jan 20');
        cy.contains('03:00');
    })
})