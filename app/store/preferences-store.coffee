Store       = require 'fluxible/addons/BaseStore'
storage     = require './local-storage'
config      = require '../config'

class PreferencesStore extends Store
  @storeName: 'PreferencesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @preferences = @loadPreferences()

  getLanguage: ->
    @preferences.language || config.defaultLanguage

  setLanguage: (language) ->
    if language not in config.availableLanguages
      console.error  "Could not set language " + language + " as it is not configured as availableLanguage"
      return

    @preferences.language = language
    @storePreferences()
    if document
      document.cookie = "lang=" + language

    @emitChange(language)

  loadPreferences: ->
    if window?
      preferences = storage.getPreferencesStorage()
      if typeof preferences.language == undefined
        return {}
      else
        language: if window.locale then window.locale else config.defaultLanguage
    else
      language: config.defaultLanguage

  storePreferences: () ->
    storage.setPreferencesStorage(@preferences)

  @handlers:
    "SetLanguage": 'setLanguage'

module.exports = PreferencesStore
