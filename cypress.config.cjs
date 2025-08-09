// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    supportFile: 'cypress/support/e2e.cjs',
    experimentalStudio: true, // Enable Cypress Studio
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});