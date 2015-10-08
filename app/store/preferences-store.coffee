Store             = require 'fluxible/addons/BaseStore'

STORAGE_KEY       = "userPreferences"
ALLOWED_LANGUAGES = ['fi', 'sv', 'en']

class PreferencesStore extends Store
  @storeName: 'PreferencesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @preferences = @loadPreferences()
    if @preferences == undefined || @preferences == null
      @preferences = {}
    # init language if not defined
    if @preferences.language == undefined
      if window?
        @preferences.language = window.locale
      else
        @preferences.language = 'en'

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
    if !window?
      return undefined
    storage = window.localStorage
    preferences = storage.getItem(STORAGE_KEY)
    JSON.parse(preferences)

  storePreferences: () ->
    storage = window.localStorage
    p = JSON.stringify(@preferences)
    window.localStorage.setItem(STORAGE_KEY, p)

  @handlers:
    "SetLanguage": 'setLanguage'

module.exports = PreferencesStore
