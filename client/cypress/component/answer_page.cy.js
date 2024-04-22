import AnswerHeader from "../../src/components/main/answerPage/header";
import QuestionBody from "../../src/components/main/answerPage/questionBody";
import { toast } from 'react-toastify';

// Answer Page - Header Tests
it('Answer Header component shows question title, answer count and onclick function', () => {
    const answerCount = 3;
    const title = 'android studio save string shared preference, start activity and load the saved string';
    const handleNewQuestion = cy.spy().as('handleNewQuestionSpy');

    cy.mount(<AnswerHeader
        ansCount={answerCount}
        title={title}
        handleNewQuestion={handleNewQuestion}/>);
    cy.get('.bold_title').contains(answerCount + " answers");
    cy.get('.answer_question_title').contains(title);
    cy.get('.bluebtn').click();
    cy.get('@handleNewQuestionSpy').should('have.been.called');
})

// Answer Page - Question Body
it('Component should have a question body which shows question text, views, asked by, date, and intial vote', () => {
    const questionBody = 'Sample Question Body'
    const views = '150'
    const askedBy = 'testUser'
    const date = new Date().toLocaleString()
    const initialVote = 10;
    const qid = '123';

    cy.mount(<QuestionBody
        text={questionBody}
        views={views}
        askby={askedBy}
        meta={date}
        initialVote={initialVote}
        qid={qid}
    />)

    cy.get('.answer_question_text').contains(questionBody);
    cy.get('.answer_question_view').contains(views + ' views');
    cy.get('.question_author').contains(askedBy);
    cy.get('.answer_question_meta').contains('asked ' + date);
    cy.get('#vote_count').should('have.text', initialVote.toString());

})

it('handles upvote and then downvote interactions', () => {
    const questionBody = 'Sample Question Body'
    const views = '150'
    const askedBy = 'testUser'
    const date = new Date().toLocaleString()
    const initialVote = 10;
    const qid = '123';

    let currentVoteCount = initialVote;

    // Mock the castVote API call
    const apiEndpoint = 'http://localhost:8000/vote/vote';

    cy.intercept('POST', apiEndpoint, (req) => {
        // Check what voteType is being requested and manipulate the response accordingly
        if (req.body.voteType === 'upvote') {
            req.reply({
                          statusCode: 201,
                          body: { vote_count: currentVoteCount + 1 } // Ensure this matches the expected response structure
                      });
        } else if (req.body.voteType === 'downvote') {
            req.reply({
                          statusCode: 201,
                          body: { vote_count: currentVoteCount - 2 } // Handle downvote case
                      });
        }
    }).as('castVote');

    cy.mount(<QuestionBody
        text={questionBody}
        views={views}
        askby={askedBy}
        meta={date}
        initialVote={initialVote}
        qid={qid}
    />)

    cy.get('.answer_question_text').contains(questionBody);
    cy.get('.answer_question_view').contains(views + ' views');
    cy.get('.question_author').contains(askedBy);
    cy.get('.answer_question_meta').contains('asked ' + date);
    cy.get('#vote_count').should('have.text', initialVote.toString());

    // Simulate upvote
    cy.get('#upVoteQ').click();
    cy.get('#upVoteQ').should('have.class', 'active');
    cy.wait('@castVote')
    cy.get('#vote_count').should('have.text', (initialVote + 1).toString());
    // Simulate downvote
    cy.get('#downVoteQ').click();
    cy.get('#downVoteQ').should('have.class', 'active');
    cy.wait('@castVote');
    cy.get('#vote_count').should('have.text', (initialVote - 2).toString()); // since it changed from upvote to downvote

})

it('handles upvote interaction', () => {
    const questionBody = 'Sample Question Body'
    const views = '150'
    const askedBy = 'testUser'
    const date = new Date().toLocaleString()
    const initialVote = 10;
    const qid = '123';

    let currentVoteCount = initialVote;

    // Mock the castVote API call
    const apiEndpoint = 'http://localhost:8000/vote/vote';

    cy.intercept('POST', apiEndpoint, (req) => {
        // Check what voteType is being requested and manipulate the response accordingly
        if (req.body.voteType === 'upvote') {
            req.reply({
                          statusCode: 201,
                          body: { vote_count: currentVoteCount + 1 } // Ensure this matches the expected response structure
                      });
        }
    }).as('castVote');

    cy.mount(<QuestionBody
        text={questionBody}
        views={views}
        askby={askedBy}
        meta={date}
        initialVote={initialVote}
        qid={qid}
    />)

    cy.get('.answer_question_text').contains(questionBody);
    cy.get('.answer_question_view').contains(views + ' views');
    cy.get('.question_author').contains(askedBy);
    cy.get('.answer_question_meta').contains('asked ' + date);
    cy.get('#vote_count').should('have.text', initialVote.toString());

    // Simulate upvote
    cy.get('#upVoteQ').click();
    cy.get('#upVoteQ').should('have.class', 'active');
    cy.get('#downVoteQ').should('not.have.class', 'active');
    cy.wait('@castVote')
    cy.get('#vote_count').should('have.text', (initialVote + 1).toString());

})

it('handles downvote interaction', () => {
    const questionBody = 'Sample Question Body'
    const views = '150'
    const askedBy = 'testUser'
    const date = new Date().toLocaleString()
    const initialVote = 10;
    const qid = '123';

    let currentVoteCount = initialVote;

    // Mock the castVote API call
    const apiEndpoint = 'http://localhost:8000/vote/vote';

    cy.intercept('POST', apiEndpoint, (req) => {
        // Check what voteType is being requested and manipulate the response accordingly
        if (req.body.voteType === 'downvote') {
            req.reply({
                          statusCode: 201,
                          body: { vote_count: currentVoteCount - 1 } // Ensure this matches the expected response structure
                      });
        }
    }).as('castVote');

    cy.mount(<QuestionBody
        text={questionBody}
        views={views}
        askby={askedBy}
        meta={date}
        initialVote={initialVote}
        qid={qid}
    />)

    cy.get('.answer_question_text').contains(questionBody);
    cy.get('.answer_question_view').contains(views + ' views');
    cy.get('.question_author').contains(askedBy);
    cy.get('.answer_question_meta').contains('asked ' + date);
    cy.get('#vote_count').should('have.text', initialVote.toString());

    // Simulate upvote
    cy.get('#downVoteQ').click();
    cy.get('#downVoteQ').should('have.class', 'active');
    cy.get('#upVoteQ').should('not.have.class', 'active');
    cy.wait('@castVote')
    cy.get('#vote_count').should('have.text', (initialVote - 1).toString());

})

it('toast message when 403 error', () => {
    const questionBody = 'Sample Question Body'
    const views = '150'
    const askedBy = 'testUser'
    const date = new Date().toLocaleString()
    const initialVote = 10;
    const qid = '123';

    // Mock the castVote API call
    const apiEndpoint = 'http://localhost:8000/vote/vote';
    cy.spy(toast, 'error').as('toastError');

    cy.intercept('POST', apiEndpoint, {
        statusCode: 403,  // Simulating an error response
        body: { error: "Insufficient reputation to cast a vote." }
    }).as('castVoteError');

    cy.mount(<QuestionBody
        text={questionBody}
        views={views}
        askby={askedBy}
        meta={date}
        initialVote={initialVote}
        qid={qid}
    />)

    // Simulate upvote
    cy.get('#upVoteQ').click();
    cy.wait('@castVoteError');
    cy.get('@toastError').should('have.been.calledWith', "You do not have enough reputation points to vote.");
})

it('toast message when 403 error', () => {
    const questionBody = 'Sample Question Body'
    const views = '150'
    const askedBy = 'testUser'
    const date = new Date().toLocaleString()
    const initialVote = 10;
    const qid = '123';

    // Mock the castVote API call
    const apiEndpoint = 'http://localhost:8000/vote/vote';
    cy.spy(toast, 'error').as('toastError');

    cy.intercept('POST', apiEndpoint, {
        statusCode: 409,  // Simulating an error response
        body: { error: "You have already cast this vote." }
    }).as('castVoteError');

    cy.mount(<QuestionBody
        text={questionBody}
        views={views}
        askby={askedBy}
        meta={date}
        initialVote={initialVote}
        qid={qid}
    />)

    // Simulate upvote
    cy.get('#upVoteQ').click();
    cy.wait('@castVoteError');
    cy.get('@toastError').should('have.been.calledWith', "You have already cast this vote.");
})

// Answer Page - Answer component
// it('Component should have a answer text ,answered by and answered date', () => {
//     const answerText = 'Sample Answer Text'
//     const answeredBy = 'joydeepmitra'
//     const date = new Date().toLocaleString()
//     cy.mount(<Answer
//         text={answerText}
//         ansBy={answeredBy}
//         meta={date}
//     />)
//
//     cy.get('.answerText').contains(answerText)
//     cy.get('.answerAuthor > .answer_author').contains(answeredBy)
//     cy.get('.answerAuthor > .answer_question_meta').contains(date)
//
//
// })

// Anwer Page  - Main Component
// it('Render a Answer Page Component and verify all details', () => {
//     const handleNewQuestion = cy.spy().as('handleNewQuestionSpy')
//     const handleNewAnswer = cy.spy().as('handleNewAnswerSpy')
//     const answers = []
//     for(let index= 1; index <= 2; index++){
//         let newanswer = {
//             aid: index,
//             text: 'Sample Answer Text '+index,
//             ansBy: 'sampleanswereduser'+index,
//             ansDate: new Date(),
//         };
//         answers.push(new AnswerObj(newanswer))
//     }
//
//     let question = {
//         title: 'Sample Question Title',
//         text: 'Sample Question Text',
//         askedBy: 'vanshitatilwani',
//         askDate: new Date(),
//         views : 150,
//         ansIds : answers.map(answer => answer.aid)
//     };
//
//     cy.mount(<AnswerPage
//         question={new Question(question)}
//         ans={answers}
//         handleNewQuestion={handleNewQuestion}
//         handleNewAnswer={handleNewAnswer}
//     />)
//
//     cy.get('.bold_title').contains(answers.length + " answers")
//     cy.get('.answer_question_title').contains(question.title)
//     cy.get('#answersHeader > .bluebtn').click()
//     cy.get('@handleNewQuestionSpy').should('have.been.called');
//
//     cy.get('.answer_question_text > div').contains(question.text)
//     cy.get('.answer_question_view').contains(question.views + ' views')
//     cy.get('.answer_question_right > .question_author').contains(question.askedBy)
//
//     cy.get('.answerText')
//         .eq(0)
//         .find('div')
//         .should('have.text', answers[0].text);
//     cy.get('.answerAuthor > .answer_author').eq(0).should('have.text', answers[0].ansBy)
//
//     cy.get('.answerText')
//         .eq(1)
//         .find('div')
//         .should('have.text', answers[1].text);
//     cy.get('.answerAuthor > .answer_author').eq(0).should('have.text', answers[0].ansBy)
//
//     cy.get('.ansButton').click();
//     cy.get('@handleNewAnswerSpy').should('have.been.called');
//
// })