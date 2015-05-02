Store = require 'fluxible/addons/BaseStore'

class StopInformationStore extends Store
  @storeName: 'StopInformationStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @stops = {}

  getStop: (id) =>
    @stops[id]

  storeStopInformation: (data) ->
    @stops[data.id] = data
    @emitChange(data.id)

  @handlers:
    "StopInformationFound": 'storeStopInformation'

module.exports = StopInformationStore