React = require 'react'
Relay = require 'react-relay'
Icon  = require '../icon/icon'
RouteList = require '../stop-cards/route-list'
FormattedMessage = require('react-intl').FormattedMessage

class DisruptionRow extends React.Component
  render: ->
    <div className='row'>
      <section className='grid-content'>
        <div className='disruption-header disruption'>
          <RouteList className="left" routes={route for route in @props.routes when route}/>
          <span className='time bold'>{@props.startTime.format("HH:mm")} - {@props.endTime.format("HH:mm")}</span>
        </div>
        <div className='disruption-content'>
          <p>
            {@props.description}
          </p>
        </div>
        <div className='disruption-details hide'>
          <span><b className='uppercase'><FormattedMessage id="cause" defaultMessage="cause"/>:</b> {@props.cause}</span>
        </div>
      </section>
    </div>


module.exports = DisruptionRow
