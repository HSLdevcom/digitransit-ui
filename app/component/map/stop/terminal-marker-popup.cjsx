React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../../queries'
DepartureListContainer = require '../../departure/departure-list-container'
Icon                  = require '../../icon/icon.cjsx'
Link                  = require 'react-router/lib/Link'
MarkerPopupBottom     = require '../marker-popup-bottom'
NotImplementedLink = require '../../util/not-implemented-link'
{FormattedMessage} = require('react-intl')
moment                = require 'moment'
pluck = require 'lodash/collection/pluck'
sortBy = require 'lodash/collection/sortBy'


class TerminalMarkerPopup extends React.Component
  render: ->
    stops = []
    sortBy(@props.terminal.stops, 'platformCode').forEach (stop, i) ->
      mode = stop.routes[0].type.toLowerCase()
      stops.push(
        <Link to="/pysakit/#{stop.gtfsId}" className="no-decoration">
          <div className="platform padding-small">
            <Icon className={mode + " platform-icon"} img={'icon-icon_' + mode}/>
            <div className="platform-texts">
              <span className="platform-name sub-header-h4">
                <FormattedMessage
                  id='platform-num'
                  defaultMessage="Platform {platformCode}"
                  values={
                    platformCode: stop.platformCode
                  }/>
              </span>
              <div className={mode + " platform-routes"}>
                {pluck(sortBy(stop.routes, 'shortName'), 'shortName').join(', ')}
              </div>
            </div>
          </div>
        </Link>
      )

    <div className="card">
      <div className="padding-small h4">
        {@props.terminal.name}
        {@props.terminal.desc}
      </div>
      <div className="terminal-platforms">
        {stops}
      </div>
      <MarkerPopupBottom
        routeHere="/reitti/#{@props.context.getStore('PositionStore').getLocationString()}/#{@props.terminal.name}::#{@props.terminal.lat},#{@props.terminal.lon}">
        <NotImplementedLink name={<FormattedMessage id='departures' defaultMessage='Departures' />}/><br/>
      </MarkerPopupBottom>
    </div>


module.exports = Relay.createContainer TerminalMarkerPopup,
  fragments: queries.TerminalMarkerPopupFragments
  initialVariables:
    date: moment().format("YYYYMMDD") # TODO check this, what date should be used?
