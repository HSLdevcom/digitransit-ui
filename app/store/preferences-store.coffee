Store             = require 'fluxible/addons/BaseStore'

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
      console.log("Rejecting illegal language", language)
      return

    @preferences.language = language
    @storePreferences()
    if document
      document.cookie = "lang=" + language

    @emitChange(language)


  loadPreferences: ->
    if window?
      storage = window.localStorage
      preferences = storage.getItem(STORAGE_KEY)
      if preferences?
        JSON.parse(preferences)
      else
        language: if window.locale then window.locale else 'en'
    else
      language: 'en'

  storePreferences: () ->
    storage = window.localStorage
    p = JSON.stringify(@preferences)
    window.localStorage.setItem(STORAGE_KEY, p)

  @handlers:
    "SetLanguage": 'setLanguage'

module.exports = PreferencesStore
