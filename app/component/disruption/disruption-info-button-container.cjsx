React                = require 'react'
Relay                = require 'react-relay'
queries              = require '../../queries'
DisruptionInfoButton = require './disruption-info-button'

class DisruptionInfoButtonContainer extends React.Component
  @propTypes:
    toggleDisruptionInfo: React.PropTypes.func

  render: ->
    if typeof window != 'undefined'
      <Relay.RootContainer
        Component={DisruptionInfoButton}
        forceFetch={true}
        route={new queries.DisruptionInfoRoute}
        renderFetched={(data) =>
          <DisruptionInfoButton
            toggleDisruptionInfo={@props.toggleDisruptionInfo}
            {...data}
          />
        }
      />
    else
      <div></div>

module.exports =DisruptionInfoButtonContainer
