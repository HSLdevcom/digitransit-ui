React       = require 'react'
TimeStore   = require '../../store/time-store'
TimeActions = require '../../action/time-action'
moment      = require 'moment'

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
    @forceUpdate()

  changeTime: =>
    hour = @refs.hour.getDOMNode().value
    minute = @refs.minute.getDOMNode().value
    date = @refs.date.getDOMNode().value
    @context.executeAction TimeActions.setCurrentTime,
      moment("#{hour}:#{minute} #{date}", "H:m YYYY-MM-DD")

  render: ->

    if not @props.visible
      return null

    time = @context.getStore(TimeStore).getTime()

    hours = []
    for hour in [0..23]
      hours.push <option key={hour} value={hour}>{hour}</option>

    minutes = []
    for minute in [0..59]
      minutes.push <option key={minute} value={minute}>{minute}</option>

    dates = []
    date = moment()
    dates.push <option value={date.format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>Tänään</option>
    dates.push <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>Huomenna</option>
    for day in [0..28]
      dates.push <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>{date.format('dd D.M')}</option>

    <div className="sub-navigation">
      <div className="row">
        <div className="small-12 columns">
          <div className="arrow-up"></div>
          <span className="timeseparator">:</span>
          <select ref="hour" className="time hour" value={time.format('H')} onChange={this.changeTime}>
            {hours}
          </select>
          <select ref="minute" className="time minute" value={time.format('m')} onChange={this.changeTime}>
            {minutes}
          </select>
          <select ref="date" value={time.format('YYYY-MM-DD')} onChange={this.changeTime}>
            {dates}
          </select>
          <select>
            <option>Lähtöaika</option>
            <option>Saapumisaika</option>
          </select>
        </div>
      </div>
    </div>

module.exports = IndexSubNavigation
