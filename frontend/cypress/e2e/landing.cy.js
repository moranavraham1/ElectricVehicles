describe('Landing Page Test', () => {
  it('successfully loads and displays the main heading', () => {
    cy.visit('/');
    cy.contains('h1', 'Empowering Your Electric Journey').should('be.visible');
  });
}); 