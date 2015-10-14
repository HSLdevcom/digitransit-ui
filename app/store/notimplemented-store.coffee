Store    = require 'fluxible/addons/BaseStore'

class NotImplementedStore extends Store

  click: (details) =>
    @emitChange({id:details.Id, defaultMessage:details.defaultMessage})

  @handlers:
    "click": "click"

module.exports = NotImplementedStore
