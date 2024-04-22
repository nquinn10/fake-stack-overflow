import NewQuestion from "../../src/components/main/newQuestion";
import {addQuestion} from "../../src/services/questionService";

// New Question Component
it('mounts', () => {
    cy.mount(<NewQuestion/>)
    cy.get('#formTitleInput')
    cy.get('#formTextInput')
    cy.get('#formTagInput')
    cy.get('.form_postBtn')
})

it('shows title inputted by user', () => {
    cy.mount(<NewQuestion/>)
    cy.get('#formTitleInput').should('have.value', '')
    cy.get('#formTitleInput').type('abc')
    cy.get('#formTitleInput').should('have.value', 'abc')
})

it('shows text inputted by user', () => {
    cy.mount(<NewQuestion/>)
    cy.get('#formTextInput').should('have.value', '')
    cy.get('#formTextInput').type('abc')
    cy.get('#formTextInput').should('have.value', 'abc')
})

it('shows tags inputted by user', () => {
    cy.mount(<NewQuestion/>)
    cy.get('#formTagInput').should('have.value', '')
    cy.get('#formTagInput').type('abc')
    cy.get('#formTagInput').should('have.value', 'abc')
})

it('shows error message when inputs are empty', () => {
    cy.mount(<NewQuestion/>)
    cy.get('.form_postBtn').click()
    cy.get('div .input_error').contains('Title cannot be empty')
    cy.get('div .input_error').contains('Question text cannot be empty')
    cy.get('div .input_error').contains('Should have at least 1 tag')
})

it('shows error message when title is more than 100 characters', () => {
    cy.mount(<NewQuestion/>)
    cy.get('#formTitleInput').type('a'.repeat(101))
    cy.get('.form_postBtn').click()
    cy.get('div .input_error').contains('Title cannot be more than 100 characters')
})

it('shows error message when there are more than five tags', () => {
    cy.mount(<NewQuestion/>)
    cy.get('#formTagInput').type('a b c d e f')
    cy.get('.form_postBtn').click()
    cy.get('div .input_error').contains('Cannot have more than 5 tags')
})

it('shows error message when a tag is longer than 20 characters', () => {
    cy.mount(<NewQuestion/>)
    cy.get('#formTagInput').type('a'.repeat(21))
    cy.get('.form_postBtn').click()
    cy.get('div .input_error').contains('New tag length cannot be more than 20')
})

it('submits the form successfully when inputs are valid', () => {
    const handleQuestions = cy.stub();
    cy.intercept('POST', 'http://localhost:8000/question/addQuestion', (req) => {
        expect(req.body).to.deep.equal({
                                           title: 'Valid Title',
                                           text: 'Valid Text http://valid-url.com',
                                           tags: ['tag1', 'tag2'],
                                           ask_date_time: req.body.ask_date_time
                                       });
        req.reply({ statusCode: 200, body: {
                _id: '12345',
                title: 'Valid Title',
                text: 'Valid Text http://valid-url.com',
                tags: ['tag1', 'tag2'],
                ask_date_time: req.body.ask_date_time} });
    }).as('addQuestion');

    cy.mount(<NewQuestion handleQuestions={handleQuestions} />);
    cy.get('#formTitleInput').type('Valid Title');
    cy.get('#formTextInput').type('Valid Text http://valid-url.com');
    cy.get('#formTagInput').type('tag1 tag2');
    cy.get('.form_postBtn').click();
    cy.wait('@addQuestion').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body).to.deep.include({
                                                               _id: '12345',
                                                               title: 'Valid Title',
                                                               text: 'Valid Text http://valid-url.com',
                                                               tags: ['tag1', 'tag2']
                                                           });
        expect(interception.response.body).to.have.property('ask_date_time');
    });
    cy.wrap(handleQuestions).should('have.been.called');
});

it('handleQuestion is called when click Post Question', () => {
    const handleQuestions = cy.spy().as('handleQuestionsSpy');
    cy.mount(
        <NewQuestion handleQuestions={handleQuestions}
        />);

    const QUESTION_API_URL = 'http://localhost:8000/question';
    cy.intercept('POST', `${QUESTION_API_URL}/addQuestion`, {
        statusCode: 200,
        body: {
            _id: '123',  // Mock response with a fake question ID
            title: 'Sample Question Title',
            text: 'Sample Question Text',
            tags: ['tag1', 'tag2'],
            ask_date_time: new Date().toISOString()
        }
    }).as('addQuestion');

    cy.get('#formTitleInput').type('title1')
    cy.get('#formTextInput').type('Valid question text with http://valid-link.com');
    cy.get('#formTagInput').type('tag1 tag2')
    cy.get('.form_postBtn').click();
    cy.wait('@addQuestion');
    cy.get('@handleQuestionsSpy').should('have.been.calledOnce');
})