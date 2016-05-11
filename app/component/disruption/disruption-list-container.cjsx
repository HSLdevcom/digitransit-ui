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
    if @props.alerts.alerts.length == 0
      return <FormattedMessage id="disruption-info-no-alerts" defaultMessage="No disruption info."/>

    alerts = @props.alerts.alerts.map (alert) =>
      id = alert.id
      startTime = moment(alert.effectiveStartDate * 1000)
      endTime = moment(alert.effectiveEndDate * 1000)
      cause = 'because'#alert.cause
      description = find(alert.alertDescriptionTextTranslations, ['language', @context.intl.locale])?.text
      routes = [alert.route]
      <DisruptionRow key={id} description={description} startTime={startTime} endTime={endTime} cause={cause} routes={routes}/>

    <div>{alerts}</div>

module.exports = Relay.createContainer DisruptionListContainer,
  fragments: queries.DisruptionListContainerFragments
