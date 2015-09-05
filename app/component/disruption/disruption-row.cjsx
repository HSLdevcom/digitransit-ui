React = require 'react'
Icon  = require '../icon/icon'


class DisruptionRow extends React.Component
  render: ->
    <div className='row'>
      <section className='grid-content'>
        <div className='disruption-header disruption'>
          <div className='icon center'>
            <Icon viewBox="0 0 40 40" img={'icon-icon_' + @props.mode} className={@props.mode}/>
          </div>
          <span className='line bus bold'>{@props.line}</span>
          <span className='time bold'>{@props.startTime.format("HH:mm")} - {@props.endTime.format("HH:mm")}</span>
        </div>
        <div className='disruption-content'>
          <p>
            {@props.description}
          </p>
        </div>
        <div className='disruption-details hide'>
          <span><b className='uppercase'>syy:</b> {@props.cause}</span>
        </div>
      </section>
    </div>

module.exports = DisruptionRow
