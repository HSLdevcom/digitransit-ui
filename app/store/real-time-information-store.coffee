Store = require 'fluxible/addons/BaseStore'

class RealTimeInformationStore extends Store
  @storeName: 'RealTimeInformationStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @vehicles = {}

  storeClient: (client) =>
    @client = client

  clearClient: ->
    @client = undefined
    @vehicles = {}

  handleMessage: (message) ->
    @vehicles[message.id] = message.message
    #console.log @vehicles[id]
    @emitChange(message.id)

  getVehicle: (id) =>
    @vehicles[id]

  @handlers:
    "RealTimeClientStarted": 'storeClient'
    "RealTimeClientStopped": 'clearClient'
    "RealTimeClientMessage": 'handleMessage'

module.exports = RealTimeInformationStore