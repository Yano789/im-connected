describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/');


    cy.get('[href="/login"] > .top-button').click();
    //login
    cy.get(':nth-child(2) > .form-input').type('BooBoo');
    cy.get(':nth-child(3) > .form-input').type('BooB000!');
    cy.get('.login-button').click();

    //Make a post
    cy.get(':nth-child(2) > .dashboard').click();
    cy.get('.toPostMain > :nth-child(1)').click();
    //create the content of post
    cy.get('.createPostWrapper').click().type('This is a test post');
    cy.get('.tags > :nth-child(2)').click();
    cy.get('.addTextWrapper').click().type('This is a test content');
    cy.get('.buttonStyle1 > .tagText').click();
    cy.get('.x').click();
    //select all tag
    cy.get(':nth-child(1) > .topicMainDefault > .topicImage').click();

    //check content of post
    cy.get('.forumBody > :nth-child(1)').should('have.class', 'post');
    cy.get(':nth-child(1) > .data > .forumTitle > .titleOfPostParent > .postTitle').should('have.class', 'postTitle');
    cy.get(':nth-child(1) > .data > .forumTitle > .titleOfPostParent > .postTitle').should('have.text', 'This is a test post');
    cy.get(':nth-child(1) > .data > .forumTitle > .nameParent > .postUser').should('have.class', 'postUser');
    cy.get(':nth-child(1) > .data > .forumTitle > .nameParent > .postUser').should('have.text', 'BooBoo');
    cy.get(':nth-child(1) > .description > .postDescription').should('have.class', 'postDescription');
    cy.get(':nth-child(1) > .description > .postDescription').should('have.text', 'This is a test content');
    cy.get(':nth-child(1) > .data > .forumTitle > .tags > .tagItem').should('have.class', 'tagItem');
    cy.get(':nth-child(1) > .data > .forumTitle > .tags > .tagItem').should('have.text', 'Personal Mental Health');
    
  });
});
