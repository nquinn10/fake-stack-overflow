import NewAnswer from "../../src/components/main/newAnswer";

// New Answer Component
it('mounts', () => {
    cy.mount(<NewAnswer/>)
    cy.get('#answerTextInput')
    cy.get('.form_postBtn')
})

it('shows error message when text input is empty', () => {
    cy.mount(<NewAnswer/>)
    cy.get('.form_postBtn').click()
    cy.get('div .input_error').contains('Answer text cannot be empty')
})

it('shows text inputted by user', () => {
    cy.mount(<NewAnswer/>)
    cy.get('#answerTextInput').should('have.value', '')
    cy.get('#answerTextInput').type('abc')
    cy.get('#answerTextInput').should('have.value', 'abc')
})

it('submits the answer form successfully when inputs are valid', () => {
    const qid = "123";
    const handleAnswer = cy.stub();

    cy.intercept('POST', 'http://localhost:8000/answer/addAnswer', (req) => {
        expect(req.body).to.deep.equal({
                                           qid: qid,
                                           ans: {
                                               text: 'Valid Answer Text',
                                               ans_date_time: req.body.ans.ans_date_time
                                           }
                                       });
        req.reply({
                      statusCode: 200,
                      body: { _id: 'abc123' }
                  });
    }).as('addAnswer');

    cy.mount(<NewAnswer qid={qid} handleAnswer={handleAnswer} />);
    cy.get('#answerTextInput').type('Valid Answer Text');
    cy.get('.form_postBtn').click();
    cy.wait('@addAnswer').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
    });
});

it('calls handleAnswer when the answer is successfully posted', () => {
    const qid = "123"; // Example question ID
    const handleAnswer = cy.spy().as('handleAnswerSpy');

    cy.intercept('POST', `http://localhost:8000/answer/addAnswer`, {
        statusCode: 200,
        body: {
            _id: 'abc123', // Mock successful response
            text: 'Valid Answer Text',
            ans_date_time: new Date().toISOString()
        }
    }).as('addAnswer');

    cy.mount(<NewAnswer qid={qid} handleAnswer={handleAnswer} />);
    cy.get('#answerTextInput').type('Valid Answer Text');
    cy.get('.form_postBtn').click();
    cy.wait('@addAnswer');
    cy.get('@handleAnswerSpy').should('have.been.calledWith', "123")
});
