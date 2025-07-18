import './commands';

beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

Cypress.Commands.add('login', (username = 'testuser', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username,
      password
    }
  }).then((response) => {
    window.localStorage.setItem('authToken', response.body.token);
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('authToken');
});