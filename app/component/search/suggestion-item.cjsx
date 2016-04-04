React          = require 'react'
Icon           = require '../icon/icon'
cx             = require 'classnames'
SuggestionUtil = require '../../util/suggestion-utils'
{FormattedMessage} = require 'react-intl'


getIcon = (layer, iconClass) ->
  layerIcon =
    "favourite": "icon-icon_star"
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

SuggestionItem.getName =  (props) ->
  lbl = SuggestionUtil.getLabel(props)
  if lbl == undefined
    lbl = <FormattedMessage id='own-position' defaultMessage='Your current location' /> #todo fix
  lbl

module.exports = SuggestionItem
