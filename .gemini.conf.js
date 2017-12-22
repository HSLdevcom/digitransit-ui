module.exports = {
  "rootUrl": "http://localhost:8080",
  "screenshotsDir": "./test/visual-images/",
  "httpTimeout": 40000,
  "sessionRequestTimeout": 120000,
  "sessionsPerBrowser": 3,
  "suitesPerSession": 10,
  "retry": 1,
  "system": {
    "plugins": { "browserstack": { "localIdentifier": process.env.IDENTIFIER } },
    "parallelLimit": 3
  },
  "browsers": {
    "ie11": {
      "windowSize": "600x1024",
      "desiredCapabilities": {
        "os": "Windows",
        "os_version": "8.1",
        "browserName": "internet explorer",
        "browser": "IE",
        "browser_version": "11",
        "locationContextEnabled": false
      }
    },
    "chrome50": {
      "windowSize": "600x1024",
      "desiredCapabilities": {
        "os": "OS X",
        "os_version": "El Capitan",
        "browserName": "chrome",
        "version": "50",
        "locationContextEnabled": false
      }
    },
    "safari10": {
      "windowSize": "600x1024",
      "desiredCapabilities": {
        "os": "OS X",
        "os_version": "Sierra",
        "browserName": "safari",
        "version": "10.1",
	"safari.options" : {
           "technologyPreview": true
	},
        "locationContextEnabled": false
      }
    },
    "edge13": {
      "windowSize": "600x1024",
      "desiredCapabilities": {
        "os": "Windows",
        "os_version": "10",
        "browserName": "edge",
        "version": "13",
        "locationContextEnabled": false
      }
    }
  }
}
