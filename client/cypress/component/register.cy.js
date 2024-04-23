import Register from "../../src/components/auth/register";

// Register Component
it('mounts the component and checks initial form state', () => {
    cy.mount(<Register onRegister={cy.spy()} />);
    // Check initial state of inputs
    cy.get('#email').should('have.value', '');
    cy.get('#password').should('have.value', '');
    cy.get('#firstName').should('have.value', '');
    cy.get('#lastName').should('have.value', '');
    cy.get('#displayName').should('have.value', '');
    cy.get('#aboutMe').should('have.value', '');
    cy.get('#location').should('have.value', '');
});

it('validates input fields are correctly filled by the user', () => {
    cy.mount(<Register onRegister={cy.spy()} />);
    cy.get('#email').type('user@example.com').should('have.value', 'user@example.com');
    cy.get('#password').type('password123').should('have.value', 'password123');
    cy.get('#firstName').type('John').should('have.value', 'John');
    cy.get('#lastName').type('Doe').should('have.value', 'Doe');
    cy.get('#displayName').type('JohnD').should('have.value', 'JohnD');
    cy.get('#aboutMe').type('Developer').should('have.value', 'Developer');
    cy.get('#location').type('City').should('have.value', 'City');
});

it('validates inputs are required', () => {
    const onRegister = cy.spy();
    cy.mount(<Register onRegister={onRegister} />);
    cy.get('#registerButton').click();
    cy.get('#email + .input_error').should('contain', 'Email cannot be empty');
    cy.get('#password + .input_error').should('contain', 'Password cannot be empty');
    cy.get('#firstName + .input_error').should('contain', 'First name cannot be empty');
    cy.get('#lastName + .input_error').should('contain', 'Last name cannot be empty');
    cy.get('#displayName + .input_error').should('contain', 'Display name cannot be empty');
});

it('shows custom error message on form submission failure', () => {
    // Assuming you'd mock a failure response for the registration API call
    cy.intercept('POST', 'http://localhost:8000/user/register', {
        statusCode: 400,
        body: { message: 'User already exists. Please log in.' }
    }).as('failedRegister');
    cy.mount(<Register onRegister={cy.spy()} />);
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password123');
    cy.get('#firstName').type('John');
    cy.get('#lastName').type('Doe');
    cy.get('#displayName').type('JohnD');
    cy.get('#registerButton').click();
    cy.wait('@failedRegister');
    cy.get('.input_error').should('contain', 'User already exists. Please log in.');
});

it('triggers onRegister callback when registration is successful', () => {
    // Assuming a success response for the registration
    cy.intercept('POST', 'http://localhost:8000/user/register', {
        statusCode: 200,
        body: { message: 'User registered successfully', display_name: 'JohnDoe' }
    }).as('successfulRegister');
    const onRegister = cy.spy().as('onRegisterSpy');
    cy.mount(<Register onRegister={onRegister} />);
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password123');
    cy.get('#firstName').type('John');
    cy.get('#lastName').type('Doe');
    cy.get('#displayName').type('JohnD');
    cy.get('#registerButton').click();
    cy.wait('@successfulRegister');
    cy.get('@onRegisterSpy').should('have.been.calledOnceWith', 'JohnDoe');
});
