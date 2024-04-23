import Header from "../../src/components/header";

// Header Component
it('header shows search bar and title', () => {
    const setQuesitonPageSpy = cy.spy().as('setQuesitonPageSpy')
    const searchQuery = ''
    const title = 'Fake Stack Overflow'
    cy.mount(<Header
        search={searchQuery}
        setQuesitonPage={setQuesitonPageSpy}/>)
    cy.get('#searchBar').should('have.value', searchQuery)
    cy.get('#searchBar').should('have.attr', 'placeholder')
    cy.get('.title').contains(title)
})

it('search bar shows search text entered by user', () => {
    const setQuesitonPageSpy = cy.spy().as('setQuesitonPageSpy')
    const searchQuery = 'test search'
    cy.mount(<Header
        search={searchQuery}
        setQuesitonPage={setQuesitonPageSpy}/>)
    cy.get('#searchBar').should('have.value', searchQuery)
    cy.get('#searchBar').type('{selectall}{backspace}Search change')
    cy.get('#searchBar').should('have.value', 'Search change')
})

it('set question page called when enter is pressed in search', () => {
    const setQuesitonPageSpy = cy.spy().as('setQuesitonPageSpy')
    const searchQuery = 'test search'
    cy.mount(<Header
        search={searchQuery}
        setQuesitonPage={setQuesitonPageSpy}/>)
    cy.get('#searchBar').type('{selectall}{backspace}Search change{enter}')
    cy.get('@setQuesitonPageSpy').should('have.been.calledWith', 'Search change', 'Search Results')
})

it('shows user icons when user is logged in', () => {
    const userMock = { name: 'John Doe' }
    const showProfile = cy.spy().as('showProfile')
    const logout = cy.spy().as('logout')
    const showPostMod = cy.spy().as('showPostMod')
    cy.mount(<Header user={userMock} showProfile={showProfile} logout={logout} showPostMod={showPostMod} />)
    cy.get('#userProfileButton').click()
    cy.get('@showProfile').should('have.been.calledOnce')
    cy.get('#postModerationButton').click()
    cy.get('@showPostMod').should('have.been.calledOnce')
    cy.get('#logoutButton').click()
    cy.get('@logout').should('have.been.calledOnce')
})

it('displays login and register buttons when user is not signed in', () => {
    const showLogin = cy.spy().as('showLogin');
    const showRegister = cy.spy().as('showRegister');

    cy.mount(<Header
        search=""
        setQuestionPage={cy.spy()}
        showLogin={showLogin}
        showRegister={showRegister}
        showProfile={cy.spy()}
        showPostMod={cy.spy()}
        logout={cy.spy()}
        user={null}  // explicitly setting user to null to represent logged out state
    />);

    cy.get('.auth-buttons button').should('have.length', 2); // Expecting two buttons
    cy.contains('button', 'Login').should('be.visible').click();
    cy.get('@showLogin').should('have.been.calledOnce');
    cy.contains('button', 'Register').should('be.visible').click();
    cy.get('@showRegister').should('have.been.calledOnce');
});