import Login from "../../src/components/auth/login";


// Login Component
it('validates inputs correctly', () => {
    const onLogin = cy.spy();
    cy.mount(<Login onLogin={onLogin} />);
    cy.get('#loginButton').click();
    cy.get('#loginEmailInput + .input_error').should('contain', 'Email cannot be empty');
    cy.get('#loginPasswordInput + .input_error').should('contain', 'Password cannot be empty');
});

it('logs in successfully when credentials are correct', () => {
    const onLogin = cy.spy().as('onLoginSpy');
    cy.intercept('POST', 'http://localhost:8000/user/login', {
        statusCode: 200,
        body: { email: 'testUser@gmail.com', password: '12345678' }
    }).as('loginRequest');
    cy.mount(<Login onLogin={onLogin} />);

    cy.get('#loginEmailInput').type('user@example.com');
    cy.get('#loginPasswordInput').type('password123');
    cy.get('#loginButton').click();
    cy.wait('@loginRequest');
    cy.get('@onLoginSpy').should('have.been.calledOnceWith', { email: 'testUser@gmail.com', password: '12345678' });
});

it('shows error message on failed login - existing user but invalid password', () => {
    cy.intercept('POST', 'http://localhost:8000/user/login', {
        statusCode: 401,
        body: 'Invalid password. Please try again.'
    }).as('failedLoginRequest');
    cy.mount(<Login onLogin={cy.spy()} />);

    cy.get('#loginEmailInput').type('user@example.com');
    cy.get('#loginPasswordInput').type('wrongpassword');
    cy.get('#loginButton').click();
    cy.wait('@failedLoginRequest');
    cy.get('.input_error').should('contain', 'Invalid password. Please try again.');
});

it('shows error message on failed login - user not found', () => {
    cy.intercept('POST', 'http://localhost:8000/user/login', {
        statusCode: 404,
        body: 'User not found. Please register.'
    }).as('failedLoginRequest');
    cy.mount(<Login onLogin={cy.spy()} />);

    cy.get('#loginEmailInput').type('user@example.com');
    cy.get('#loginPasswordInput').type('wrongpassword');
    cy.get('#loginButton').click();
    cy.wait('@failedLoginRequest');
    cy.get('.input_error').should('contain', 'User not found. Please register.');
});