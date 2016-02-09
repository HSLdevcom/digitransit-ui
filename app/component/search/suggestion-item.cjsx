React = require 'react'
Icon = require '../icon/icon'

getNumberIfNotZero = (number) ->
  if number and not (number is "0") then " #{number}" else ""

getLocality = (suggestion) ->
  if suggestion.locality
    suggestion.locality
  else ""

getName =  (suggestion) ->
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

getIcon = (layer) ->
  switch layer
    when 'address'
      <Icon img="icon-icon_place"/>
    when 'stop'
      <Icon img="icon-icon_bus-stop"/>
    when 'locality'
      <Icon img="icon-icon_city"/>
    when 'station'
      <Icon img="icon-icon_station"/>
    when 'localadmin'
      <Icon img="icon-icon_city"/>
    when 'neighbourhood'
      <Icon img="icon-icon_city"/>
    else
      <Icon img="icon-icon_place"/>

SuggestionItem = (props) ->
  displayText = getName props.item.properties
  <span id={displayText}>
    {getIcon props.item.properties.layer}
    {displayText}
  </span>

module.exports = SuggestionItem

