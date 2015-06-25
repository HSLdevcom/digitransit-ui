React       = require 'react'
TimeStore   = require '../../store/time-store'
TimeActions = require '../../action/time-action'
moment      = require 'moment'

class TimeSelectors extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore(TimeStore).addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore(TimeStore).removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  changeTime: =>
    hour = @refs.hour.getDOMNode().value
    minute = @refs.minute.getDOMNode().value
    date = @refs.date.getDOMNode().value
    @context.executeAction TimeActions.setCurrentTime,
      moment("#{hour}:#{minute} #{date}", "H:m YYYY-MM-DD")

  setArriveBy: =>
    @context.executeAction TimeActions.setArriveBy, @refs.arriveBy.getDOMNode().value

  getHours: ->
    <option key={hour} value={hour}>{hour}</option> for hour in [0..23]

  getMinutes: ->
    <option key={minute} value={minute}>{minute}</option> for minute in [0..59]

  getDates: ->
    dates = []
    date = moment()
    dates.push <option value={date.format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>Tänään</option>
    dates.push <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>Huomenna</option>
    for day in [0..28]
      dates.push <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>{date.format('dd D.M')}</option>
    dates

  render: ->
    time = @context.getStore(TimeStore).getTime()
    arriveBy = @context.getStore(TimeStore).getArriveBy()

    <div className="time-selectors">
      <select ref="hour" className="time hour" value={time.format('H')} onChange={this.changeTime}>
        {@getHours()}
      </select>
      <span className="timeseparator">:</span>
      <select ref="minute" className="time minute" value={time.format('m')} onChange={this.changeTime}>
        {@getMinutes()}
      </select>
      <select ref="date" value={time.format('YYYY-MM-DD')} onChange={this.changeTime}>
        {@getDates()}
      </select>
      <select ref="arriveBy" value={arriveBy} onChange={this.setArriveBy}>
        <option value="false">Lähtöaika</option>
        <option value="true">Saapumisaika</option>
      </select>
    </div>

module.exports = TimeSelectors
