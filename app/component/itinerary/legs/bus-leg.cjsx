React = require 'react'
timeUtils    = require '../../../util/time-utils'
TransitLeg   = require './transit-leg'
intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class BusLeg extends React.Component

  render: ->

    <TransitLeg
      mode={"BUS"}
      leg={@props.leg}
      focusAction={@props.focusAction}
      index={@props.index}
      >
      <FormattedMessage
        id={"bus-with-route-number"}
        values={{
          routeNumber: @props.leg.route?.shortName
          headSign: @props.leg.trip?.tripHeadsign
          }}
        defaultMessage={"Bus {routeNumber} {headSign}"}/>
    </TransitLeg>


module.exports = BusLeg
