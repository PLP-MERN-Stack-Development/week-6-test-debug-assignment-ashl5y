Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('createPost', (postData) => {
  const defaultPost = {
    title: 'Test Post',
    content: 'Test Content',
    category: 'Technology'
  };
  
  const post = { ...defaultPost, ...postData };
  
  cy.getByTestId('create-post-button').click();
  cy.get('input[name="title"]').type(post.title);
  cy.get('textarea[name="content"]').type(post.content);
  cy.get('input[name="category"]').type(post.category);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('waitForPostsToLoad', () => {
  cy.intercept('GET', '/api/posts').as('getPosts');
  cy.wait('@getPosts');
});

Cypress.Commands.add('mockApiError', (endpoint, statusCode = 500) => {
  cy.intercept('GET', endpoint, {
    statusCode,
    body: { error: 'Server error' }
  });
});