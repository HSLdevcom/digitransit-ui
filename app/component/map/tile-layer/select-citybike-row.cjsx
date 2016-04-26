React                 = require 'react'
Icon                  = require '../../icon/icon'
{FormattedMessage}    = require 'react-intl'


SelectCitybikeRow = (props) ->
  <div className="no-margin">
    <hr className="no-margin"/>
    <div className="cursor-pointer" onClick={props.selectRow}>
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
