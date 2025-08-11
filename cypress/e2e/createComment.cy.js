describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/')


    cy.get('[href="/login"] > .top-button').click();
    //login 
    cy.get(':nth-child(2) > .form-input').type('BooBoo');
    cy.get(':nth-child(3) > .form-input').type('BooB000!');

    cy.get('.login-button').click();
    //enter forum
    cy.get('.icons > :nth-child(2) > .applicationIcon').click();
    //view a post
    cy.get(':nth-child(1) > .stats > .commentsNumber > .commentsIcon').click();
    //make a comment and post it
    cy.get('.addComment').click().type('Hi this is a comment!');
    cy.get('.viewPostButton').click();

    //Check that they have the right components and content
    cy.get('.viewPostCommentsDiv > :nth-child(3)').should('have.class', 'commentDiv');
    cy.get(':nth-child(3) > .commentBody > .commentUsername').should('have.class', 'commentUsername');
    cy.get(':nth-child(3) > .commentBody > .commentUsername').should('have.text', 'BooBoo');
    cy.get(':nth-child(3) > .commentContent').should('have.class', 'commentContent');
    cy.get(':nth-child(3) > .commentContent').should('have.text', 'Hi this is a comment!');
    cy.get(':nth-child(3) > .commentBody > .commentDate').should('have.class', 'commentDate');
  })
})