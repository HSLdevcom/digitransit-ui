React = require 'react'
timeUtils    = require '../../../util/time-utils'
TransitLeg   = require './transit-leg'
intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class TramLeg extends React.Component

  render: ->

    <TransitLeg
      mode={"TRAM"}
      leg={@props.leg}
      focusAction={@props.focusAction}
      index={@props.index}
      >
      <FormattedMessage
        id={"tram-with-route-number"}
        values={{
          routeNumber: @props.leg.route
          }}
        defaultMessage={"Tram {routeNumber}"}/>
    </TransitLeg>


module.exports = TramLeg
