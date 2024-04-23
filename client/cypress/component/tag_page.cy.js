import Tag from "../../src/components/main/tagPage/tag";
import TagPage from "../../src/components/main/tagPage";

// Tag Component

it('Rendering Tag Component', () => {
    const tag = { name : 'Sample Tag ',  qcnt: '1'}
    const clickTag = (name) => console.log('Clicked on clickTag '+ name)

    cy.window().then((win) => {
        cy.spy(win.console, 'log').as('consoleLogSpy');
    });

    cy.mount(<Tag
        t={tag}
        clickTag={clickTag}
    />)
    cy.get('.tagNode > .tagName').contains(tag.name.trim())
    cy.get('div.tagNode').invoke('text').then((text) => {
        expect(text).to.equal(tag.name + tag.qcnt + ' questions');
    })
})

// Tag Page Component

it('Rendering Tag Page Component', () => {
    const tagsData = [
        { name: 'Sample Tag 1', qcnt: 5 },
        { name: 'Sample Tag 2', qcnt: 3 }
    ];
    const clickTag = (name) => console.log('Clicked on clickTag ' + name);
    const onClickText = 'Ask a question';
    const handleNewQuestion = () => console.log(onClickText);

    cy.intercept('GET', 'http://localhost:8000/tag/getTagsWithQuestionNumber', {
        statusCode: 200,
        body: tagsData,
    }).as('fetchTags');

    cy.window().then((win) => {
        cy.spy(win.console, 'log').as('consoleLogSpy');
    });

    cy.mount(<TagPage clickTag={clickTag} handleNewQuestion={handleNewQuestion} />);
    cy.wait('@fetchTags');

    cy.get('.bold_title').first().contains(tagsData.length + ' Tags');
    cy.get('.bold_title').last().contains('All Tags');

    cy.get('.bluebtn').click();
    cy.get('@consoleLogSpy').should('have.been.calledWith', onClickText);

    tagsData.forEach(tag => {
        cy.get('.tagNode > .tagName').contains(tag.name);
        cy.get('.tagNode').contains(tag.qcnt + ' questions');
    });
});
