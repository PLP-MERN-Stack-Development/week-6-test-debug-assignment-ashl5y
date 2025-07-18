const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'client/cypress/support/e2e.js',
    specPattern: 'client/cypress/integration/**/*.spec.js',
    fixturesFolder: 'client/cypress/fixtures',
    screenshotsFolder: 'client/cypress/screenshots',
    videosFolder: 'client/cypress/videos',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshot: true,
    setupNodeEvents(on, config) {
    },
  },
});