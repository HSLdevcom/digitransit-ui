fs = require "fs"

module.exports.takeScreenshot = (driver, imgName) ->
  driver.takeScreenshot().then (img) -> 
    fs.writeFile(imgName, img, 'base64', (err) -> 
      if err console.log(err)
