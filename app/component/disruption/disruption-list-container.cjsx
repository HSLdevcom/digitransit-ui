React            = require 'react'
Relay            = require 'react-relay'
queries          = require '../../queries'
moment           = require 'moment'
DisruptionRow    = require './disruption-row'
{FormattedMessage, intlShape} = require('react-intl')
find             = require 'lodash/find'

class DisruptionListContainer extends React.Component
  @contextTypes:
    intl: intlShape

  render: ->
    alerts = []
    for alert in @props.alerts.alerts
      id = alert.id
      startTime = moment(alert.effectiveStartDate * 1000)
      endTime = moment(alert.effectiveEndDate * 1000)
      cause = 'because'#alert.cause
      description = find(alert.alertDescriptionTextTranslations, ['language', @context.intl.locale])?.text
      routes = [alert.route]
      alerts.push <DisruptionRow key={id} description={description} startTime={startTime} endTime={endTime} cause={cause} routes={routes}/>

    if @props.alerts.alerts.length == 0
      noAlerts = <FormattedMessage id="disruption-info-no-alerts" defaultMessage="No disruption info."/>

    <div>
      {alerts}
      {noAlerts}
    </div>

module.exports = Relay.createContainer DisruptionListContainer,
  fragments: queries.DisruptionListContainerFragments
