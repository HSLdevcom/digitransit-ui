React = require 'react'
timeUtils    = require '../../../util/time-utils'
TransitLeg   = require './transit-leg'
intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class RailLeg extends React.Component

  render: ->

    <TransitLeg
      mode={"RAIL"}
      leg={@props.leg}
      focusAction={@props.focusAction}
      index={@props.index}
      >
      <FormattedMessage
        id={"train-with-route-number"}
        values={{
          routeNumber: @props.leg.route?.shortName
          }}
        defaultMessage={"Train {routeNumber}"}/>
    </TransitLeg>


module.exports = RailLeg
