import OrderButton from "../../src/components/main/questionPage/header/orderButton";
import QuestionHeader from "../../src/components/main/questionPage/header";
import Question from "../../src/components/main/questionPage/question";

// Question Page - Order Button
it('Rendering Order Button', () => {
    const message = 'Test Message'
    const setQuestionOrderSpy = cy.spy('').as('setQuestionOrderSpy')

    cy.mount(<OrderButton
        message={message}
        setQuestionOrder={setQuestionOrderSpy}/>)
    cy.get('.btn').click()
    cy.get('@setQuestionOrderSpy').should('have.been.calledWith', message);

})

// Question Page - Header Component
it('Rendering Question Header', () => {
    const title = 'Sample Title'
    const count = 1
    const handleNewQuestionSpy = cy.spy().as('handleNewQuestionSpy')
    const setQuestionOrderSpy = cy.spy().as('setQuestionOrderSpy')

    cy.mount(<QuestionHeader
        title_text={title}
        qcnt = {count}
        setQuestionOrder={setQuestionOrderSpy}
        handleNewQuestion={handleNewQuestionSpy}/>)

    cy.get('.bold_title').contains(title)
    cy.get('.bluebtn').click()
    cy.get('@handleNewQuestionSpy').should('have.been.called');
    cy.get('#question_count').contains(count + ' questions')
    cy.get('.btns .btn').eq(0).should('have.text', 'Newest');
    cy.get('.btns .btn').eq(1).should('have.text', 'Active');
    cy.get('.btns .btn').eq(2).should('have.text', 'Unanswered');
    cy.get('.btns .btn').each(($el, index, $list) => {
        cy.wrap($el).click();
        cy.get('@setQuestionOrderSpy').should('have.been.calledWith', $el.text());
    })
})

// Question Body
it('Rendering Question Body', () => {
    const answers = [
        { aid: '1', text: 'Sample Answer Text 1', ansBy: 'sampleanswereduser1', ansDate: new Date() },
        { aid: '2', text: 'Sample Answer Text 2', ansBy: 'sampleanswereduser2', ansDate: new Date() }
    ];
    const tags = [
        { _id: 'tagId1', name: 'react' },
        { _id: 'tagId2', name: 'javascript' }
    ];

    let question = {
        _id: '1212',
        title: 'Sample Question Title',
        text: 'Sample Question Text greater than 98 characters. '
              + 'Sample Question Text greater than 98 characters. '
              + 'Sample Question Text greater than 98 characters.'
              + 'Sample Question Text greater than 98 characters.',
        asked_by: {
            display_name: 'fakeUserName'
        },
        ask_date_time: new Date('Jan 17, 2024 03:24'),
        views : 150,
        answers : answers.map(answer => answer.aid),
        tags: tags,
        vote_count: 10
    };

    // checking to make sure question text is truncated appropriately
    const truncateText = (text, maxLength = 98) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '    ... see more' : text;
    };

    let textPreview = truncateText(question.text);

    const handleAnswerSpy = cy.spy().as('handleAnswerSpy')
    const clickTagSpy =  cy.spy().as('clickTagSpy')

    cy.mount(<Question
        q={question}
        clickTag={clickTagSpy}
        handleAnswer={handleAnswerSpy}/>)

    question.tags.forEach(tag => {
        cy.get('.question_tags .question_tag_button').contains(tag.name).click();
        cy.get('@clickTagSpy').should('have.been.calledWith', tag.name);
    });


    cy.get('.postTitle').contains(question.title)
    cy.get('.postText').should('contain', '... see more').and('have.text', textPreview);
    cy.get('.postStats').contains(answers.length + ' answers')
    cy.get('.postStats').contains(question.views + ' views')
    cy.get('.postStats').contains(question.vote_count + ' votes')
    cy.get('.question_tags .question_tag_button').contains('react')
    cy.get('.question_tags .question_tag_button').contains('javascript')
    cy.get('.lastActivity .question_author').contains(question.asked_by.display_name)
    cy.get('.lastActivity .question_meta').contains('asked Jan 17 at 03:24')
    cy.get('.question').click()
    cy.get('@handleAnswerSpy').should('have.been.calledWith', question._id)
})