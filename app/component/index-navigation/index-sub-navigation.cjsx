React       = require 'react'
TimeStore   = require '../../store/time-store' 
TimeActions = require '../../action/time-action'

class IndexSubNavigation extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func

  propTypes =
    visible: React.PropTypes.bool.isRequired

  componentDidMount: ->
    @context.getStore(TimeStore).addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore(TimeStore).removeChangeListener @onChange

  onChange: =>
    # What to do when time passes?

  changeTime: =>
    hour = @refs.hour.getDOMNode().value
    minute = @refs.minute.getDOMNode().value
    date = @refs.date.getDOMNode().value
    @context.executeAction TimeActions.setCurrentTime, {
      'date': date, 
      'hour': hour, 
      'minute': minute
    }

  render: ->

    if not @props.visible
      return null

    ts = @context.getStore(TimeStore)

    hours = []
    for hour in [0..23]
      hourString = ts.createPrefixZeroIfUnderTen(hour)
      if hour == ts.getTimeHour()
        hours.push <option selected value={hourString}>{hourString}</option>
      else 
        hours.push <option value={hourString}>{hourString}</option>

    minutes = []
    for minute in [0..59]
      minuteString = ts.createPrefixZeroIfUnderTen(minute)
      if minute == ts.getTimeMinute()
        minutes.push <option selected value={minuteString}>{minuteString}</option>
      else
        minutes.push <option value={minuteString}>{minuteString}</option>

    <div className="sub-navigation">
      <div className="row">
        <div className="small-12 columns">
          <div className="arrow-up"></div>
          <span className="timeseparator">:</span>
          <select ref="hour" className="time hour" onChange={this.changeTime}>
            {hours}
          </select>
          <select ref="minute" className="time minute" onChange={this.changeTime}>
            {minutes}
          </select>
          <select ref="date" onChange={this.changeTime}>
            <option value="today">Tänään</option>
            <option value="tomorrow">Huomenna</option>
          </select>
          <select>
            <option>Lähtöaika</option>
            <option>Saapumisaika</option>
          </select>
        </div>
      </div>
    </div>

module.exports = IndexSubNavigation
