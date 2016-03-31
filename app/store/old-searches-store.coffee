Store   = require 'fluxible/addons/BaseStore'
storage = require './local-storage'
orderBy = require 'lodash/orderBy'

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
    searches = @getOldSearches()
    found = searches.filter (storedDestination) ->
      storedDestination.address == destination.address

    switch found.length
      when 0 then searches.push Object.assign count: 1, destination
      when 1 then found[0].count = found[0].count + 1
      else console.error "too many matches", found

    storage.setOldSearchesStorage orderBy searches, "count", "desc"
    @emitChange(destination)

  getOldSearches: () ->
    storage.getOldSearchesStorage()

  @handlers:
    "SaveSearch": 'saveSearch'

module.exports = OldSearchesStore
