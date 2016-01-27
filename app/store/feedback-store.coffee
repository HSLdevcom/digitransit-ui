Store = require 'fluxible/addons/BaseStore'

class FeedbackStore extends Store
  @storeName: 'FeedbackStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @modalOpen = false

  isModalOpen: () ->
    @modalOpen

  openFeedbackModal: () ->
    @modalOpen = true
    @emitChange()

  closeFeedbackModal: () ->
    @modalOpen = false
    @emitChange()

  @handlers:
    "OpenFeedbackModal": 'openFeedbackModal'
    "CloseFeedbackModal": 'closeFeedbackModal'

module.exports = FeedbackStore
