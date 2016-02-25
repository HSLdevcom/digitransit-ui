Store       = require 'fluxible/addons/BaseStore'
storage     = require './local-storage'
config      = require '../config'
STORAGE_KEY = "userPreferences"


class PreferencesStore extends Store
  @storeName: 'PreferencesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @preferences = @loadPreferences()

  getLanguage: ->
    @preferences.language || config.defaultLanguage

  setLanguage: (language) ->
    console.log config.availableLanguages
    if language not in config.availableLanguages
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
        language: if window.locale then window.locale else config.defaultLanguage
    else
      language: config.defaultLanguage

  storePreferences: () ->
    storage.setItem(STORAGE_KEY, @preferences)

  @handlers:
    "SetLanguage": 'setLanguage'

module.exports = PreferencesStore
