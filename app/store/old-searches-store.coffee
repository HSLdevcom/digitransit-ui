Store   = require 'fluxible/addons/BaseStore'
storage = require './localStorage'
orderBy = require 'lodash/orderBy'

class OldSearchesStore extends Store

  @storeName: 'OldSearchesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    #migrate old searches
    storage.setOldSearchesStorage @getOldSearches().map (item) ->
      item.type = item.type || "endpoint"
      item

  # storage (sorted by count desc):
  # [
  #  {
  #   "address": "Espoo, Espoo",
  #   "coordinates" :[]
  #   "count": 1
  #   "type": "endpoint" or "search"
  #  }
  # ]
  saveSearch: (destination) ->
    searches = @getOldSearches()
    found = searches.filter (storedSearch) ->
      storedSearch.type == destination.type
    .filter (storedSearch) ->
      storedSearch.address == destination.address

    switch found.length
      when 0 then searches.push Object.assign count: 1, destination
      when 1 then found[0].count = found[0].count + 1
      else console.error "too many matches", found

    storage.setOldSearchesStorage orderBy searches, "count", "desc"

    searches = @getOldSearches()
    @emitChange(destination)

  getOldSearches: (type) ->
    storage.getOldSearchesStorage().filter (item) -> if type then item.type == type else true

  @handlers:
    "SaveSearch": 'saveSearch'

module.exports = OldSearchesStore
