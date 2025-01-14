// e2e tests for home page (All questions page)
// add tests vote vote count in postStats, Login/Register buttons, User/Flag buttons too?

describe('template spec', () => {

  beforeEach(() => {
    // Seed the database before each test
    cy.exec("node ../server/init.js");
  });

  afterEach(() => {
    // Clear the database after each test
    cy.exec("node ../server/destroy.js");
  });

  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })


  it('successfully shows All Questions string', () => {
      cy.visit('http://localhost:3000');
      cy.contains('All Questions');
  })


  it('successfully shows Ask a Question button', () => {
      cy.visit('http://localhost:3000');
      cy.contains('Ask a Question');
  })


  it('successfully shows total questions number', () => {
      cy.visit('http://localhost:3000');
      // our test DB has 5 questions initially
      cy.contains('5 questions');
  })



  it('successfully shows filter buttons', () => {
      cy.visit('http://localhost:3000');
      cy.contains('Newest');
      cy.contains('Active');
      cy.contains('Unanswered');
  })



  it('successfully shows menu items', () => {
      cy.visit('http://localhost:3000');
      cy.contains('Questions');
      cy.contains('Tags');
  })


  it('successfully shows search bar', () => {
      cy.visit('http://localhost:3000');
      cy.get('#searchBar');
  })



  it('successfully shows page title', () => {
      cy.visit('http://localhost:3000');
      cy.contains('Fake Stack Overflow');
  })


  it('successfully shows all questions in model', () => {
      const qTitles = ['Best pizza in Boston?', 'Quick question about storage on android', 'Object storage for a web application', 'android studio save string shared preference, start activity and load the saved string', 'Programmatically navigate using React router'];
      cy.visit('http://localhost:3000');
      cy.get('.postTitle').each(($el, index, $list) => {
          cy.wrap($el).should('contain', qTitles[index]);
      })
  })


// add test to ensure question preview text is shown on home page, not just title
  it('successfully shows preview text for questions in model', () => {
    const qTexts = ['Not technical but maybe someone has a good rec', 'I would like to know', 'I am currently working on', 'I am using bottom navigation', 'the alert shows'];
    cy.visit('http://localhost:3000');
    cy.get('.postText').each(($el, index, $list) => {
      cy.wrap($el).should('contain', qTexts[index]);
  })
  })


// postStats should contain votes too
  it('successfully shows all question stats', () => {
      const answers = ['0 answers','2 answers', '2 answers', '3 answers', '2 answers'];
      const views = ['20 views','103 views', '200 views', '121 views', '10 views'];
      const votes = ['-16 votes', '0 votes', '0 votes', '-1 votes', '1 votes'];
      cy.visit('http://localhost:3000');
      cy.get('.postStats').each(($el, index, $list) => {
          cy.wrap($el).should('contain', answers[index]);
          cy.wrap($el).should('contain', views[index]);
          cy.wrap($el).should('contain', votes[index]);
      })
  })


  it('successfully shows all question authors and date time', () => {
      const authors = ['johnny_d', 'sammysmith', 'sammysmith', 'betty_j', 'betty_j'];
      const date = ['Apr 14', 'Mar 10', 'Feb 18', 'Jan 10', 'Jan 20'];
      const times = ['21:17', '14:28', '01:02', '11:24', '03:00'];
      cy.visit('http://localhost:3000');
      cy.get('.lastActivity').each(($el, index, $list) => {
          cy.wrap($el).should('contain', authors[index]);
          cy.wrap($el).should('contain', date[index]);
          cy.wrap($el).should('contain', times[index]);
      })
  })



  it('successfully shows all questions in model in active order', () => {
      const qTitles = ['Programmatically navigate using React router', 'android studio save string shared preference, start activity and load the saved string', 'Quick question about storage on android', 'Object storage for a web application', 'Best pizza in Boston?'];
      cy.visit('http://localhost:3000');
      cy.contains('Active').click();
      cy.get('.postTitle').each(($el, index, $list) => {
          cy.wrap($el).should('contain', qTitles[index]);
      })
  })


  it('successfully shows all unanswered questions in model', () => {
      const qTitles = ['Best Pizza in Boston?'];
      cy.visit('http://localhost:3000');
      cy.contains('Unanswered').click();
      cy.contains('1 questions');
  })



  it('successfully highlights "Questions" link when on the home page', () => {
      cy.visit('http://localhost:3000');
      cy.get('.sideBarNav').contains('Questions').should('have.css', 'background-color', 'rgb(204, 204, 204)');
  })


  it('successfully highlights "Tags" link when on the Tags page', () => {
      cy.visit('http://localhost:3000');
      cy.contains('Tags').click();
      cy.get('.sideBarNav').contains('Tags').should('have.css', 'background-color', 'rgb(204, 204, 204)');
  })
})