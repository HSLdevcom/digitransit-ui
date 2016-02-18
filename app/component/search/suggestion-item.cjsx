React = require 'react'
Icon = require '../icon/icon'
cx = require 'classnames'
{FormattedMessage} = require 'react-intl'

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
    "currentPosition": "icon-icon_position"

  defaultIcon = "icon-icon_place"
  <Icon img={layerIcon[layer] || defaultIcon} className={iconClass || ""}/>

SuggestionItem = (props) ->
  displayText = SuggestionItem.getName props.item.properties
  <span id={displayText} className={cx "search-result", props.item.type}>
    <span className={props.spanClass || ""}>
      {getIcon props.item.properties.layer, props.iconClass}
    </span>
    {displayText}
  </span>

SuggestionItem.getName =  (suggestion) ->
  name = switch suggestion.layer
    when 'address'
      "#{suggestion.street}#{getNumberIfNotZero suggestion.housenumber}, #{getLocality suggestion}"
    when 'locality'
      "#{suggestion.name}, #{getLocality suggestion}"
    when 'neighbourhood'
      "#{suggestion.name}, #{getLocality suggestion}"
    when 'venue'
      "#{suggestion.name}, #{getLocality suggestion}"

  if name == undefined
    if suggestion.labelId != undefined
      name = <FormattedMessage id="own-position" defaultMessage='Your current location' />

  if name == undefined
    name = suggestion.label

  name

module.exports = SuggestionItem
