module.export.takeScreenshot(imgName) {
  driver.takeScreenshot().then(function(img) {
    require("fs").writeFile(imgName, img, 'base64', function(err) {
      if (err) console.log(err)
    })
  })
}