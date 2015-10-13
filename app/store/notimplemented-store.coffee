Store    = require 'fluxible/addons/BaseStore'

class NotImplementedStore extends Store

  click: (details) =>
    console.log "@store!", details
    @emitChange({id:details.Id, defaultMessage:details.actionDefaultMessage})

  @handlers:
    "click": "click"

module.exports = NotImplementedStore
