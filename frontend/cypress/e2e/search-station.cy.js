describe('Login and Search Station Test', () => {
  it('should login successfully and search for a station in Ashdod', () => {
    // First navigate to login page
    cy.visit('/login');
    
    // Fill the login form with test credentials
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('Aa123456');
    
    // Submit the login form
    cy.get('button[type="submit"]').click();
    
    // Wait for navigation to home page
    cy.url().should('include', '/home');
    
    // Search for the station
    cy.get('input.search-bar').type('HaTzionut Street 10, Ashdod');
    
    // Wait for the search results to appear
    cy.wait(8000);
    
    // Verify the search results contain the expected station info
    cy.contains('Address: HaTzionut 10').should('be.visible');
    cy.contains('City: Ashdod').should('be.visible');
    cy.contains('Charging Stations: 4').should('be.visible');
  });
}); 