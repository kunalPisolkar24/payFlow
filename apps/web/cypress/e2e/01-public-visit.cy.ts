describe('Public Page Navigation and Verification', () => {
    beforeEach(() => {
    cy.visit('/');
  });

    context('Navigation to Login Page ("/login")', () => {

    it('should navigate from Signup page and display structure', () => {
      cy.visit('/signup');
    });
  });

});