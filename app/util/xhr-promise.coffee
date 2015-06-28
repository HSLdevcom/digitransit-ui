serialize = (obj, prefix) ->
  if not obj
    return ""
  str = []
  for p of obj
    if obj.hasOwnProperty p
      k = if prefix then prefix + "[" + p + "]" else p
      v = obj[p]
      str.push(if typeof v == "object" then serialize(v, k) else encodeURIComponent(k) + "=" + encodeURIComponent(v))
  str.join "&"

class XhrPromise 

  # Return Promise for a url json get request
  getJson: (url, params) ->
    fetch((encodeURI(url) + if params then ("?" + serialize params) else ""),
      timeout: 10000
      method: 'GET'
      headers:
        "Accept": "application/json"
    ).then (res) ->
      res.json()

  # Return Promise for array of url json get requests
  getJsons: (urls) =>
    promises = urls.map (url) =>
      @getJson(url)
    return Promise.all(promises)
    

module.exports = new XhrPromise() 