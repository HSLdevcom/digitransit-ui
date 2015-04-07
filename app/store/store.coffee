EventEmitter = require('events').EventEmitter
CHANGE_EVENT = 'change'

class Store
  constructor: ->
    @eventEmitter = new EventEmitter

  emitChanges: ->
    @eventEmitter.emit(CHANGE_EVENT)

  addChangeListener: (callback) -> 
    @eventEmitter.on(CHANGE_EVENT, callback)
  
  removeChangeListener: (callback) ->
    @eventEmitter.removeListener(CHANGE_EVENT, callback)

module.exports = Store
