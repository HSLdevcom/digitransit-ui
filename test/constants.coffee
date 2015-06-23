if not process.env.BASE_URL then throw "No 'BASE_URL' variable found!"
if not process.env.TIMEOUT then throw "No 'TIMEOUT' variable found!"
  
console.log("Test url is '" + process.env.BASE_URL + "'")
console.log("Test timeout is '" + process.env.TIMEOUT + "'")

module.exports.BASE_URL = process.env.BASE_URL
module.exports.TIMEOUT = parseInt(process.env.TIMEOUT,10)
