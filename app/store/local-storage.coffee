module.exports =
  setItem: (k, v) ->
    if window?.localStorage?
      try
        window.localStorage.setItem k, JSON.stringify(v)
      catch error
        if error.name == 'QuotaExceededError'
          console.warn('[localStorage] Unable to save state; localStorage is not available in Safari private mode')

  getItem: (k) ->
    if window?.localStorage?
      window.localStorage.getItem k

  removeItem: (k) ->
    window?.localStorage?.removeItem k
