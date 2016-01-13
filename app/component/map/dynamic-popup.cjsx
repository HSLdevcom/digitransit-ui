React = require 'react'
ReactDOM = require 'react-dom'
Leaflet = require 'leaflet'

class DynamicPopup extends React.Component
  componentWillMount: ->
    @doCreatePopup()

  componentDidUpdate: ->
    @doCreatePopup()

  componentWillUnmount: ->
    @props.map?.removeLayer @_leafletElement

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
    # set latlng if defined specifically
    if @props.latlng
      @_leafletElement.setLatLng @props.latlng

  createLeafletPopup: (reactElement) ->
    PopupClass = Leaflet.Popup.extend
      options: reactElement.options
      _reactPopup: reactElement.popup

      onAdd: (map) ->
        # make sure our basic container exists
        if !@_container
          @_initLayout()
        # Inject our React component
        ReactDOM.render @_reactPopup, @_contentNode
        # now call "super" method
        L.Popup.prototype.onAdd.call this, map

      onRemove: (map) ->
        ReactDOM.unmountComponentAtNode(@_contentNode)
        L.Popup.prototype.onRemove.call this, map

    return new PopupClass()

module.exports = DynamicPopup
