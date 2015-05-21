React = require 'react'
Leaflet = require 'leaflet'

class DynamicPopup extends React.Component
  componentWillMount: ->
    @doCreatePopup()

  componentDidUpdate: ->
    @doCreatePopup()

  componentWillUnmount: ->
    @props.map.removeLayer @_leafletElement

  render: ->
    popup = @_leafletElement
    popupContainer = @props.popupContainer
    if popupContainer
      popupContainer.bindPopup popup
    return <noscript/>

  doCreatePopup: ->
    popup = 
      options: @props.options
      popup: @props.children
    @_leafletElement = @createLeafletPopup popup

  createLeafletPopup: (reactElement) ->
    PopupClass = Leaflet.Popup.extend
      options: reactElement.options
      _reactPopup:reactElement.popup
      onAdd: (map) ->
        # make sure our basic container exists
        if !this._container
          @_initLayout()
        # Inject our React component
        React.render @_reactPopup, @_contentNode
        # now call "super" method
        L.Popup.prototype.onAdd.call @, map
    return new PopupClass()

module.exports = DynamicPopup
