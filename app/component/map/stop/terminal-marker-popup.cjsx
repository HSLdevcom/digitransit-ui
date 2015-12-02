React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../../queries'
DepartureListContainer = require '../../departure/departure-list-container'
Icon                  = require '../../icon/icon.cjsx'
Link                  = require 'react-router/lib/Link'
MarkerPopupBottom     = require '../marker-popup-bottom'
{FormattedMessage} = require('react-intl')
moment                = require 'moment'
pluck = require 'lodash/collection/pluck'
sortBy = require 'lodash/collection/sortBy'


class TerminalMarkerPopup extends React.Component
  render: ->
    console.log @props

    stops = []
    sortBy(@props.terminal.stops, 'platformCode').forEach (stop, i) ->
      mode = stop.routes[0].type.toLowerCase()
      stops.push(
        <Link to="/pysakit/#{stop.gtfsId}" className="no-decoration">
          <div className="padding-small">
            <Icon className={mode} img={'icon-icon_' + mode}/>
            <span className="h4">
              <FormattedMessage
                id='platform-num'
                defaultMessage="Platform {platformCode}"
                values={
                  platformCode: stop.platformCode
                }/>
            </span>
            <span className={mode}>
              {pluck(sortBy(stop.routes, 'shortName'), 'shortName').join(', ')}
            </span>
          </div>
        </Link>
      )

    <div className="card">
      <div className="card-header padding-small">
        {@props.terminal.name}
        {@props.terminal.desc}
      </div>
      <div className="terminal-platforms">
        {stops}
      </div>
      <MarkerPopupBottom
        routeHere="/reitti/#{@props.context.getStore('PositionStore').getLocationString()}/#{@props.terminal.name}::#{@props.terminal.lat},#{@props.terminal.lon}">
        <Link to="/pysakit/#{@props.terminal.gtfsId}"><Icon img={'icon-icon_time'}/> Näytä lähdöt</Link><br/>
      </MarkerPopupBottom>
    </div>


module.exports = Relay.createContainer TerminalMarkerPopup,
  fragments: queries.TerminalMarkerPopupFragments
  initialVariables:
    date: moment().format("YYYYMMDD") # TODO check this, what date should be used?
