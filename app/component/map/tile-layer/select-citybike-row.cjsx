React                 = require 'react'
Icon                  = require '../../icon/icon'
NotImplementedLink    = require '../../util/not-implemented-link'
{FormattedMessage}    = require 'react-intl'
RouteDestination      = require '../../departure/route-destination'
routeCompare          = require '../../../util/route-compare'
Icon                  = require '../../icon/icon'


SelectCitybikeRow = (props) ->
  <div className="no-margin">
    <hr className="no-margin"/>
    <div onClick={props.selectCitybikeRow}>
      <div className="left padding-vertical-small" style={width: 40, fontSize: "2em", paddingLeft: 8}>
        <Icon img={'icon-icon_citybike'}/>
      </div>
      <div className="left padding-vertical-normal" style={width: "calc(100% - 40px)"}>
        <span className="h4 no-margin link-color">{props.name} ›</span>
      </div>
    </div>
  </div>

SelectCitybikeRow.displayName = "SelectCitybikeRow"

module.exports = SelectCitybikeRow
