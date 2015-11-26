React            = require 'react'
Relay            = require 'react-relay'
queries          = require '../../queries'
moment           = require 'moment'
DisruptionRow    = require './disruption-row'
FormattedMessage = require('react-intl').FormattedMessage

class DisruptionListContainer extends React.Component
  render: ->
    alerts = []
    for alert in @props.alerts.alerts
      id = alert.id
      startTime = moment(alert.effectiveStartDate * 1000)
      endTime = moment(alert.effectiveEndDate * 1000)
      cause = 'because'#alert.cause
      description = alert.alertDescriptionText
      routes = [alert.route]
      alerts.push <DisruptionRow key={id} description={description} startTime={startTime} endTime={endTime} cause={cause} routes={routes}/>

    <div>
      <h3>Alerts</h3>
      {alerts}
    </div>

module.exports = Relay.createContainer DisruptionListContainer,
  fragments: queries.DisruptionListContainerFragments
