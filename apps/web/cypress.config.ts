const {defineConfig} = require("cypress");

module.exports = defineConfig({
  e2e: {
    // @ts-ignore
    setupNodeEvents(on, config) {
    },
    baseUrl: 'https://pay-flow-staging.vercel.app/'
  },
});