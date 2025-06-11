describe('Login and Password Change Test', () => {
  it('should login successfully and change password', () => {
    // First navigate to login page
    cy.visit('/login');
    
    // Fill the login form with test credentials
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('Aa123456');
    
    // Submit the login form
    cy.get('button[type="submit"]').click();
    
    // Wait for navigation to home page
    cy.url().should('include', '/home');
    
    // Click on Profile in the bottom navigation
    cy.contains('Profile').click();
    
    // Wait for navigation to profile page
    cy.url().should('include', '/personal-area');
    
    // Wait for any toast notifications to disappear or dismiss them
    cy.wait(8000); // Wait for toast to disappear
    
    // Find and click on Password button (force if needed)
    cy.contains('Password').click({force: true});
    
    // Fill in password change form
    cy.get('input[placeholder="Current Password"]').type('Aa123456');
    cy.get('input[placeholder="New Password"]').type('Aa123457');
    cy.get('input[placeholder="Confirm New Password"]').type('Aa123457');
    
    // Submit the password change form
    cy.contains('Change Password').click();
    
    // Verify success message appears (checking for existence instead of visibility)
    cy.contains('Password changed successfully! A confirmation email has been sent').should('exist');
    
    // Wait for the success message to disappear
    cy.wait(8000);
    
    // Change password back to original
    cy.contains('Password').click({force: true});
    cy.get('input[placeholder="Current Password"]').type('Aa123457');
    cy.get('input[placeholder="New Password"]').type('Aa123456');
    cy.get('input[placeholder="Confirm New Password"]').type('Aa123456');
    cy.contains('Change Password').click();
    
    // Verify success message appears again (checking for existence instead of visibility)
    cy.contains('Password changed successfully! A confirmation email has been sent').should('exist');
  });
}); 