Store = require 'fluxible/addons/BaseStore'

STORAGE_KEY = "userPreferences"

ALLOWED_LANGUAGES = ['fi', 'sv', 'en']

class PreferencesStore extends Store
  @storeName: 'PreferencesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @preferences = @loadPreferences()
    if @preferences == undefined
      @preferences = {}

    # init language if not defined
    if @preferences.language == undefined
      @preferences.language =!window? 'en'||window.locale;

    #console.log "store preferences now " + @preferences

  getLanguage: ->
    #console.log "prefs at getLanguage" + @preferences
    lang = @preferences.language || 'fi'
    #console.log "returning lang" +lang
    lang

  setLanguage: (language) ->
    if language not in ALLOWED_LANGUAGES
      console.log("Rejecting illegal language", language);
      return;

   # console.log "store setting language " + language
    @preferences.language = language
    @storePreferences()
    if document
      document.cookie = "lang=" + language

    @emitChange(language)


  loadPreferences: ->
    #console.log "loading preferences"
    if !window?
      return undefined
    #console.log "has storage"
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
