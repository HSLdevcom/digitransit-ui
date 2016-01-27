React       = require 'react'
TimeActions = require '../../action/time-action'
moment      = require 'moment'
{FormattedMessage, intlShape} = require('react-intl')


class TimeSelectors extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intlShape.isRequired

  componentDidMount: ->
    @context.getStore('TimeStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('TimeStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  changeTime: =>
    hour = @refs.hour.getDOMNode().value
    minute = @refs.minute.getDOMNode().value
    date = @refs.date.getDOMNode().value
    @context.executeAction TimeActions.setSelectedTime,
      moment("#{hour}:#{minute} #{date}", "H:m YYYY-MM-DD")

  setArriveBy: =>
    @context.executeAction TimeActions.setArriveBy, @refs.arriveBy.getDOMNode().value

  getHours: ->
    <option key={hour} value={hour}>{hour}</option> for hour in [0..23]

  getMinutes: ->
    <option key={minute} value={minute}>{minute}</option> for minute in [0..59]

  getDates: ->
    dates = []
    date = @context.getStore("TimeStore").getCurrentTime()
    dates.push(
      <option value={date.format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>
        {@context.intl.formatMessage({id: "today", defaultMessage: "Today"})}</option>)
    dates.push(
      <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>
        {@context.intl.formatMessage({id: "tomorrow", defaultMessage: "Tomorrow"})}</option>)
    for day in [0..28]
      dates.push <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>{date.format('dd D.M')}</option>
    dates

  render: ->
    time = @context.getStore('TimeStore').getSelectedTime()
    arriveBy = @context.getStore('TimeStore').getArriveBy()

    <div className="time-selectors">
      <select ref="hour" className="time hour hide-dropdown" value={time.format('H')} onChange={@changeTime}>
        {@getHours()}
      </select>
      <span className="timeseparator">:</span>
      <select ref="minute" className="time minute hide-dropdown" value={time.format('m')} onChange={@changeTime}>
        {@getMinutes()}
      </select>
      <select className="date" ref="date" value={time.format('YYYY-MM-DD')} onChange={@changeTime}>
        {@getDates()}
      </select>
      <select className="arrive" ref="arriveBy" value={arriveBy} onChange={@setArriveBy}>
        <option value="false">
          {@context.intl.formatMessage({id: "leaving-at", defaultMessage: "Leaving at"})}</option>
        <option value="true">
          {@context.intl.formatMessage({id: "arriving-at", defaultMessage: "Arriving at"})}</option>
      </select>
    </div>

module.exports = TimeSelectors
