module.exports =
  setItem: (k, v) ->
    if window?.localStorage?
      try
        window.localStorage.setItem k, JSON.stringify(v)
      catch error
        if error.name == 'QuotaExceededError'
          console.error('[localStorage] Unable to save state; localStorage is not available in Safari private mode')
        else
          throw error
  getItem: (k) ->
    if window?.localStorage?
      window.localStorage.getItem k

  getItemAsJson: (i) ->
    item = @getItem(i)
    if (item == null) then item = "[]"
    JSON.parse(item)

  removeItem: (k) ->
    window?.localStorage?.removeItem k

  getFavouriteLocationsStorage: () ->
    @getItemAsJson("favouriteLocations")

  setFavouriteLocationsStorage: (data) ->
    @setItem("favouriteLocations", data)

  getFavouriteStopsStorage: () ->
    @getItemAsJson("favouriteStops")

  setFavouriteStopsStorage: (data) ->
    @setItem("favouriteStops", data)

  getFavouriteRoutesStorage: () ->
    @getItemAsJson("favouriteRoutes")

  setFavouriteRoutesStorage: (data) ->
    @setItem("favouriteRoutes", data)

  getModeStorage: () ->
    @getItemAsJson("mode")

  setModeStorage: (data) ->
    @setItem("mode", data)

  getPreferencesStorage: () ->
    @getItemAsJson("userPreferences")

  setPreferencesStorage: (data) ->
    @setItem("userPreferences", data)

  getOldSearchesStorage: () ->
    @getItemAsJson("saved-searches")

  setOldSearchesStorage: (data) ->
    @setItem("saved-searches", data)
