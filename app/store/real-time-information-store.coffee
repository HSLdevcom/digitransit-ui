Store = require 'fluxible/addons/BaseStore'

class RealTimeInformationStore extends Store
  @storeName: 'RealTimeInformationStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @vehicles = {}
    @subscriptions = []

  storeClient: (data) =>
    @client = data.client
    @subscriptions = data.topics

  clearClient: ->
    @client = undefined
    @vehicles = {}
    @subscriptions = []

  updateSubscriptions: (topics) =>
    @subscriptions = topics
    @vehicles = {}

  handleMessage: (message) ->
    @vehicles[message.id] = message.message
    @emitChange(message.id)

  getVehicle: (id) =>
    @vehicles[id]

  getSubscriptions: =>
    @subscriptions

  @handlers:
    "RealTimeClientStarted": 'storeClient'
    "RealTimeClientStopped": 'clearClient'
    "RealTimeClientMessage": 'handleMessage'
    "RealTimeClientTopicChanged" : 'updateSubscriptions'

module.exports = RealTimeInformationStore
