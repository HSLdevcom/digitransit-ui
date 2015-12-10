Store             = require 'fluxible/addons/BaseStore'
storage           = require './local-storage'

STORAGE_KEY       = "userPreferences"
ALLOWED_LANGUAGES = ['fi', 'sv', 'en']

class PreferencesStore extends Store
  @storeName: 'PreferencesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @preferences = @loadPreferences()

  getLanguage: ->
    @preferences.language || 'en'

  setLanguage: (language) ->
    if language not in ALLOWED_LANGUAGES
      return

    @preferences.language = language
    @storePreferences()
    if document
      document.cookie = "lang=" + language

    @emitChange(language)

  loadPreferences: ->
    if window?
      preferences = storage.getItem(STORAGE_KEY)
      if preferences?
        JSON.parse(preferences)
      else
        language: if window.locale then window.locale else 'en'
    else
      language: 'en'

  storePreferences: () ->
    storage.setItem(STORAGE_KEY, @preferences)

  @handlers:
    "SetLanguage": 'setLanguage'

module.exports = PreferencesStore
