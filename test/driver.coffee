webdriver = require 'selenium-webdriver'
chance    = require 'chance'
fs        = require 'fs'

# Generate random test id to identify tests
testId = chance().suffix({full: true}) 
console.log("Test identifier is '" + testId + "'")

buildDriver = (testName) -> 
  d = null
  if process.env.DRIVER == "local"
    console.log("Building local driver '#{testName}'")
    d = new webdriver.Builder()
      .usingServer("http://localhost:4444")
      .withCapabilities(webdriver.Capabilities.phantomjs())
      .build()  
  else if process.env.DRIVER == "saucelabs"
    console.log("Building saucelabs driver '#{testName}'")
    if not process.env.BROWSER then throw "No 'BROWSER' variable found!"
    if not process.env.PLATFORM then throw "No 'PLATFORM' variable found!"
    if not process.env.TIMEOUT then throw "No 'TIMEOUT' variable found!"
    credentials = JSON.parse(fs.readFileSync('test/credentials.json', 'utf8'))
    d = new webdriver.Builder()
      .usingServer('http://ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities
        browserName: process.env.BROWSER
        platform: process.env.PLATFORM
        name: testName
        username: credentials.saucelabs.username
        accessKey: credentials.saucelabs.apikey
        idleTimeout: 90
        tags: [testId]
      .build()
  else
    throw "No 'DRIVER' variable found!"
  console.log("Driver built.")
  return d

module.exports = buildDriver
