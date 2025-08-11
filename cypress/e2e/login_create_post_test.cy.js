describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/');

    // Navigate to login page
    cy.get('[href="/login"] > .top-button').click();

    // Clear and type username and password
    cy.get(':nth-child(2) > .form-input').clear().type('brit');
    cy.get(':nth-child(3) > .form-input').clear().type('Password!');

    // Submit login
    cy.get('.login-button').click();

    // Navigate in the app after login
    cy.get('.icons > :nth-child(2) > .applicationIcon').click();
    cy.get(':nth-child(1) > .postNow').click();
    cy.get('.createPostWrapper').click();

    // Interact with tags and modal
    cy.get('.tags > :nth-child(1) > .tagText').click();
    cy.get('.addTextWrapper').click();
    cy.get('.buttonStyle1 > .tagText').click();
    cy.get('.x').click();

    // Select topic
    cy.get(':nth-child(1) > .topicMainDefault').click();

    // Assert the first post's various properties
    cy.get('.forumBody > :nth-child(1)').should('have.class', 'post');
    cy.get(':nth-child(1) > .data > .forumTitle > .titleOfPostParent > .postTitle')
      .should('have.class', 'postTitle')
      .should('have.text', 'testing from cypress');
    cy.get(':nth-child(1) > .data > .forumTitle > .nameParent > .postUser')
      .should('have.class', 'postUser')
      .should('have.text', 'brit');
    cy.get(':nth-child(1) > .data > .forumTitle > .tags > .tagItem')
      .should('have.class', 'tagItem')
      .should('have.text', 'Physical Disability & Chronic Illness');
    cy.get(':nth-child(1) > .description > .postDescription')
      .should('have.class', 'postDescription')
      .should('have.text', 'testing from cypress');
    cy.get(':nth-child(1) > .data > .forumTitle > .titleOfPostParent > .postedParent > .postDate')
      .should('have.class', 'postDate')
      .should('have.text', '8/9/2025');
    cy.get(':nth-child(1) > .topicMainDefault').click();
  });
});
