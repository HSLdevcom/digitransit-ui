React = require 'react'
Icon = require '../icon/icon'

getNumberIfNotZero = (number) ->
  if number and not (number is "0") then " #{number}" else ""

getLocality = (suggestion) ->
  if suggestion.locality
    suggestion.locality
  else ""

getIcon = (layer, iconClass) ->
  layerIcon =
    "address": "icon-icon_place"
    "stop": "icon-icon_bus-stop"
    "locality": "icon-icon_city"
    "station": "icon-icon_station"
    "localadmin": "icon-icon_city"
    "neighbourdood": "icon-icon_city"

  defaultIcon = "icon-icon_place"
  <Icon img={layerIcon[layer] || defaultIcon} className={iconClass || ""}/>

SuggestionItem = (props) ->
  displayText = SuggestionItem.getName props.item.properties
  <span id={displayText}>
    <span className={props.spanClass || ""}>
      {getIcon props.item.properties.layer, props.iconClass}
    </span>
    {displayText}
  </span>

SuggestionItem.getName =  (suggestion) ->
  switch suggestion.layer
    when 'address'
      "#{suggestion.street}#{getNumberIfNotZero suggestion.housenumber}, #{getLocality suggestion}"
    when 'locality'
      "#{suggestion.name}, #{getLocality suggestion}"
    when 'neighbourhood'
      "#{suggestion.name}, #{getLocality suggestion}"
    when 'venue'
      "#{suggestion.name}, #{getLocality suggestion}"
    else
      "#{suggestion.label}"

module.exports = SuggestionItem
