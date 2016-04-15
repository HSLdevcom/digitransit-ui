React                 = require 'react'
Icon                  = require '../../icon/icon'
Link                  = require 'react-router/lib/Link'
{FormattedMessage}    = require 'react-intl'
RouteDestination      = require '../../departure/route-destination'
routeCompare          = require '../../../util/route-compare'
{intlShape, FormattedMessage} = require 'react-intl'

getName = (p) ->
  if p.shortName
    <span key={p.shortName} style={padding: "0 2px"} className={p.type.toLowerCase() + " vehicle-number"}>
      {p.shortName}
    </span>
  else null

SelectStopRow = ({patterns, gtfsId, type, name}, {intl}) ->
  patternData = JSON.parse(patterns).sort(routeCompare)

  patterns = []
  patterns.push(
    <div key="first" className="route-detail-text">
      <span className={patternData[0].type.toLowerCase() + " vehicle-number no-padding"}>{patternData[0].shortName}</span> {#Repalce with RouteNumber}
      <RouteDestination mode={patternData[0].type} destination={patternData[0].headsign} />
    </div>)

  if patternData.length > 1
    patterns.push(
      <div key="second" className="route-detail-text">
        <FormattedMessage id='in-addition' defaultMessage='In addition' />
        {patternData[1..].map getName}
      </div>)


  <div className="no-margin">
    <hr className="no-margin"/>
    <Link className="no-margin" to="/pysakit/#{gtfsId}">
      <div className="left padding-vertical-normal" style={width: 40}>
        <svg
          xmlns="http://www.w3.org/svg/2000"
          viewBox="0 0 30 30"
          width="30"
          height="30"
          style={position: "relative", left: 5}
          className={type.toLowerCase() + " left"}
        >
          <circle
            r="7"
            cx="15"
            cy="15"
            strokeWidth="6.5"
            fill="None"
            stroke="currentColor"
          />
        </svg>
      </div>
      <div className="left padding-vertical-normal" style={width: "calc(100% - 40px)"}>
        <span className="h4 no-margin">{name} ›</span>
        {patterns}
      </div>
    </Link>
  </div>

SelectStopRow.contextTypes =
  intl: intlShape.isRequired

module.exports = SelectStopRow
