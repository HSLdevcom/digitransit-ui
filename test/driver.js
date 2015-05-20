var webdriver = require('selenium-webdriver')
var chance = require('chance');
var fs = require('fs');
var credentials = JSON.parse(fs.readFileSync('test/credentials.json', 'utf8'));

// Generate random test id to identify tests
var testId = chance().suffix({full: true}) 
console.log("Test identifier is '" + testId + "'")

function buildDriver(testName) {
  if (process.env.DRIVER == "local") {
    return new webdriver.Builder()
      .usingServer("http://localhost:4444")
      .withCapabilities(webdriver.Capabilities.phantomjs())
      .build()  
  } else if (process.env.DRIVER == "saucelabs") {
    if (!process.env.BROWSER) throw ("No 'BROWSER' variable found!")
    if (!process.env.PLATFORM) throw ("No 'PLATFORM' variable found!")
    return new webdriver.Builder()
      .usingServer('http://ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities({
        browserName: process.env.BROWSER,
        platform: process.env.PLATFORM,
        name: testName,
        username: credentials.saucelabs.username,
        accessKey: credentials.saucelabs.apikey,
        tags: [testId]
      })
      .build()
  } else {
    throw("No 'DRIVER' variable found!")
  }
}

module.exports = buildDriver