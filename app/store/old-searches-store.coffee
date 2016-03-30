Store    = require 'fluxible/addons/BaseStore'

class OldSearchesStore extends Store

  @storeName: 'OldSearchesStore'

  constructor: (dispatcher) ->
    super(dispatcher)

  # storage (sorted by count desc):
  # [
  #  {
  #   "address": "Espoo, Espoo",
  #   "coordinates" :[]
  #   "count": 1
  #  }
  # ]
  #
  # destination
  # {
  #  "address": "Espoo, Espoo",
  #  coordinates :[]
  # }
  saveSearch: (destination) ->
    found = getOldSearches().filter (storedDestination) ->
      storedDestination.address == destination.address

    switch found.length
      when 0 then searches.push Object.assign count: 1, destination
      when 1 then found[0].count = found[0].count + 1
      else console.error "too many matches", found

    localStorage.setItem "saved-searches", orderBy searches, "count", "desc"
    @emitChange(feature)

  getOldSearches: () ->
    saved = localStorage.getItem "saved-searches"
    if saved == null
      saved = []
    else
      saved = JSON.parse(saved)
    saved

  @handlers:
    "SaveSearch": 'saveSearch'

module.exports = OldSearchesStore
