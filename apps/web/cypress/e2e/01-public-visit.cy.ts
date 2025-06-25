describe('Authentication and Navigation Flow', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/');
  });

  it('should navigate through the main user flow: landing -> signup -> login -> signup', () => {
    cy.contains('h1', 'Send Payments Worldwide').should('be.visible');
    cy.contains('a', 'Get Started !').click();

    cy.url().should('include', '/signup');
    cy.contains('h1', 'Create an account').should('be.visible');

    cy.contains('a', 'Log in').click();

    cy.url().should('include', '/login');
    cy.contains('h1', 'Log in to your account').should('be.visible');

    cy.contains('a', 'Sign up').click();

    cy.url().should('include', '/signup');
    cy.contains('h1', 'Create an account').should('be.visible');
  });

  it('should use the header buttons to navigate to login and sign up pages', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
    cy.contains('h1', 'Log in to your account').should('be.visible');

    cy.visit('/');

    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');
    cy.contains('h1', 'Create an account').should('be.visible');
  });

  it('should navigate to the documentation page from the header', () => {
    cy.get('nav').contains('Documentation').click();
    cy.url().should('include', '/docs');
    cy.contains('h2', 'Wallet App API Documentation').should('be.visible').wait(9000);
  });
});