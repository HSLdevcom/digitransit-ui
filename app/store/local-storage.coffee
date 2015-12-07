module.exports =
  setItem: (k,v)->
    if window?
      console.log "storing", k, v
      try
        window.localStorage.setItem k,JSON.stringify(v)
      catch er
        console.log("could not localStorage.setItem")

  getItem: (k)->
    if window?
      console.log "reading", k
      window.localStorage.getItem k



