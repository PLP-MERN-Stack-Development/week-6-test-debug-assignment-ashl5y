describe('Posts E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  describe('Post Creation Flow', () => {
    it('should allow user to create a new post', () => {
      cy.get('[data-testid="create-post-button"]').click();
     
      cy.get('input[name="title"]').type('My Test Post');
      cy.get('textarea[name="content"]').type('This is the content of my test post.');
      cy.get('input[name="category"]').type('Technology');
    
      cy.get('button[type="submit"]').click();
   
      cy.get('[data-testid="success-message"]').should('contain', 'Post created successfully');
      
      cy.get('[data-testid="post-list"]').should('contain', 'My Test Post');
    });

    it('should show validation errors for empty form', () => {
      cy.get('[data-testid="create-post-button"]').click();
      cy.get('button[type="submit"]').click();
      
      cy.get('[data-testid="title-error"]').should('contain', 'Title is required');
      cy.get('[data-testid="content-error"]').should('contain', 'Content is required');
      cy.get('[data-testid="category-error"]').should('contain', 'Category is required');
    });
  });

  describe('Post Viewing', () => {
    it('should display posts in the list', () => {
      cy.get('[data-testid="post-list"]').should('exist');
      cy.get('[data-testid="post-item"]').should('have.length.greaterThan', 0);
    });

    it('should allow user to view post details', () => {
      cy.get('[data-testid="post-item"]').first().click();
      cy.get('[data-testid="post-title"]').should('exist');
      cy.get('[data-testid="post-content"]').should('exist');
      cy.get('[data-testid="post-author"]').should('exist');
    });
  });

  describe('Post Search and Filter', () => {
    it('should filter posts by search term', () => {
      cy.get('[data-testid="search-input"]').type('technology');
      cy.get('[data-testid="search-button"]').click();
      
      cy.get('[data-testid="post-item"]').each(($post) => {
        cy.wrap($post).should('contain.text', 'technology');
      });
    });

    it('should filter posts by category', () => {
      cy.get('[data-testid="category-filter"]').select('Technology');
      
      cy.get('[data-testid="post-item"]').each(($post) => {
        cy.wrap($post).find('[data-testid="post-category"]').should('contain', 'Technology');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/api/posts', { forceNetworkError: true }).as('getPostsError');
      
      cy.visit('http://localhost:3000');
      cy.wait('@getPostsError');
      
      cy.get('[data-testid="error-message"]').should('contain', 'Failed to load posts');
      cy.get('[data-testid="retry-button"]').should('exist');
    });

    it('should retry failed requests', () => {
      cy.intercept('GET', '/api/posts', { forceNetworkError: true }).as('getPostsError');
      cy.intercept('GET', '/api/posts', { fixture: 'posts.json' }).as('getPostsSuccess');
      
      cy.visit('http://localhost:3000');
      cy.wait('@getPostsError');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@getPostsSuccess');
      
      cy.get('[data-testid="post-list"]').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-6');
      
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-nav"]').should('be.visible');
      
      cy.get('[data-testid="create-post-button"]').click();
      cy.get('form').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="post-grid"]').should('have.class', 'tablet-layout');
      cy.get('[data-testid="sidebar"]').should('be.visible');
    });
  });
});