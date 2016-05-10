Store    = require 'fluxible/addons/BaseStore'

class NotImplementedStore extends Store

  @storeName: 'NotImplementedStore'

  open: (feature) =>
    @feature = feature
    @emitChange(feature)

  close: () =>
    @feature = null
    @emitChange()

  getName: =>
    @feature

  @handlers:
    "openNotImplemented": "open"
    "closeNotImplemented": "close"

module.exports = NotImplementedStore
