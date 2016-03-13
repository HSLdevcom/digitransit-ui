React = require 'react'
timeUtils    = require '../../../util/time-utils'
TransitLeg   = require './transit-leg'
intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class AirplaneLeg extends React.Component

  render: ->

    <TransitLeg
      mode={"AIRPLANE"}
      leg={@props.leg}
      focusAction={@props.focusAction}
      index={@props.index}
      >
      <FormattedMessage
        id={"airplane-with-route-number"}
        values={{
          routeNumber: @props.leg.route
          }}
        defaultMessage={"Flight {routeNumber}"}/>
    </TransitLeg>


module.exports = AirplaneLeg
