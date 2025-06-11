describe('Login Page Test', () => {
  it('successfully loads login page and submits login form', () => {
    cy.visit('/login');
    
    // Fill the form with test credentials
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('Aa123456');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify successful navigation after login
    cy.url().should('include', '/home');
  });
}); 