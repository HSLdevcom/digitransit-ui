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

    @props.terminal.stops.sort(
      (a, b) ->
        a.platformCode - b.platformCode)
    stops = []
    @props.terminal.stops.forEach (stop, i) ->
      mode = stop.routes[0].type.toLowerCase()
      stops.push(
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
          <span className={"h4 " + mode}>
            {pluck(sortBy(stop.routes, 'shortName'), 'shortName').join(', ')}
          </span>
        </div>
      )

    <div className="card">
      <div className="card-header padding-small">
        {@props.terminal.name}
        {@props.terminal.desc}
      </div>
      {stops}
      <MarkerPopupBottom routeHere="/reitti/#{@props.context.getStore('PositionStore').getLocationString()}/#{stop.name}::#{stop.lat},#{stop.lon}">
        <Link to="/pysakit/#{stop.gtfsId}"><Icon img={'icon-icon_time'}/> Näytä lähdöt</Link><br/>
      </MarkerPopupBottom>
    </div>


module.exports = Relay.createContainer TerminalMarkerPopup,
  fragments: queries.TerminalMarkerPopupFragments
  initialVariables:
    date: moment().format("YYYYMMDD") # TODO check this, what date should be used?
