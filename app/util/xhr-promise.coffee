Xhr            = require 'xhr'
Promise        = (require 'es6-promise').Promise

serialize = (obj, prefix) ->
  if not obj
    return ""
  str = []
  for p of obj
    if obj.hasOwnProperty p
      k = if prefix then prefix + "[" + p + "]" else p
      v = obj[p]
      str.push(if typeof v == "object" then serialize(v, k) else encodeURIComponent(k) + "=" + encodeURIComponent(v))
  "?" + str.join "&"

class XhrPromise 

  # Return Promise for a url json get request
  getJson: (url, params) ->
    p = new Promise((resolve, reject) ->
      Xhr
        timout: 2000
        method: 'get'
        uri: encodeURI(url) + serialize(params)
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