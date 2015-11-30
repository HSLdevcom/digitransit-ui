React            = require 'react'
Relay            = require 'react-relay'
queries          = require '../../queries'
DisruptionList   = require './disruption-list'
FormattedMessage = require('react-intl').FormattedMessage

class DisruptionListContainer extends React.Component
  render: ->
    <DisruptionList alerts={@props.alerts.alerts}/>


module.exports = Relay.createContainer DisruptionListContainer,
  fragments: queries.DisruptionListContainerFragments
