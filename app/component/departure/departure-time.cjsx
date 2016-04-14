React       = require 'react'
timeUtils   = require '../../util/time-utils'
cx          = require 'classnames'
Icon        = require '../icon/icon'
ComponentUsageExample = require '../documentation/component-usage-example'
Example     = require '../documentation/example-data'
moment      = require 'moment'
intl        = require 'react-intl'
FormattedMessage   = intl.FormattedMessage

DepartureTime = (props, context) ->
  canceled = <Icon img={'icon-icon_caution'} className={'icon cancelation-info'} /> if props.canceled

  <span style={props.style} className={cx "time", "realtime": props.realtime, "canceled": props.canceled, props.className}>
    {if props.realtime and not props.canceled then <Icon img="icon-icon_realtime" className="realtime-icon realtime"/>}
    {canceled}

    {departureTime = moment(props.departureTime * 1000)
    currentTime = moment(props.currentTime * 1000)
    if departureTime.isBefore(currentTime) or departureTime.isAfter(currentTime.clone().add(20, 'minutes'))
      departureTime.format "HH:mm"
    else if currentTime.diff(departureTime, 'minutes') == 0
      <FormattedMessage id='arriving-soon' defaultMessage='Now'/>
    else
      minuteShort = context.intl.formatMessage {id: 'minute-short', defaultMessage: "min"}
      departureTime.diff(currentTime, 'minutes') + " #{minuteShort}"}
  </span>

DepartureTime.contextTypes =
  intl: intl.intlShape.isRequired

DepartureTime.description =
  <div>
    <p>Display time in correct format. Displays minutes for 20 minutes,
       otherwise in HH:mm format. Also, it takes into account if the time is realtime.</p>
    <ComponentUsageExample description="real time">
      <DepartureTime departureTime={Example.realtimeDeparture.stoptime} realtime={Example.realtimeDeparture.realtime} currentTime={Example.currentTime}/>
    </ComponentUsageExample>
    <ComponentUsageExample description="not real time">
      <DepartureTime departureTime={Example.departure.stoptime} realtime={Example.departure.realtime} currentTime={Example.currentTime}/>
    </ComponentUsageExample>
  </div>

DepartureTime.propTypes =
  departureTime: React.PropTypes.number.isRequired
  realtime: React.PropTypes.bool
  currentTime: React.PropTypes.number.isRequired
  style: React.PropTypes.object
  className: React.PropTypes.string

DepartureTime.displayName = "DepartureTime"

module.exports = DepartureTime
