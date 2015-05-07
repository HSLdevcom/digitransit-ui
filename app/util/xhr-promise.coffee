Xhr            = require 'xhr'
Promise        = (require 'es6-promise').Promise

class XhrPromise 

  # Return Promise for a url json get request
  getJson: (url) ->
    p = new Promise((resolve, reject) ->
      Xhr
        timout: 2000
        method: 'get'
        uri: encodeURI(url)
        headers:
          "Accept": "application/json"
      , (err, resp, body) ->
        if err == null
          resolve(JSON.parse(body)) 
        else 
          reject(err)
    )
    return p

  # Return Promise for array of url json get requests
  getJsons: (urls) =>
    promises = urls.map (url) =>
      @getJson(url)
    return Promise.all(promises)
    

module.exports = new XhrPromise() 