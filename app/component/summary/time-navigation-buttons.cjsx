React = require 'react'
TimeAction = require '../../action/time-action'
intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class TimeNavigationButtons extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  setEarlierSelectedTime: =>
    selectedTime = @context.getStore('TimeStore').getSelectedTime()
    earlier = selectedTime.subtract(config.summary.earlierSelectedTimeMinutes, 'minutes')
    @context.executeAction TimeAction.setSelectedTime, earlier

  setLaterSelectedTime: =>
    selectedTime = @context.getStore('TimeStore').getSelectedTime()
    later = selectedTime.add(config.summary.laterSelectedTimeMinutes, 'minutes')
    @context.executeAction TimeAction.setSelectedTime, later

  setSelectedTimeToNow: =>
    @context.executeAction TimeAction.unsetSelectedTime

  render: ->
    if @props.show
      <div className="time-navigation-buttons">
        <button className="standalone-btn" onClick={@setEarlierSelectedTime}>
          <FormattedMessage id='earlier' defaultMessage='Earlier' />
        </button>
        <button className="standalone-btn" onClick={@setSelectedTimeToNow}>
          <FormattedMessage id='now' defaultMessage='Now' />
        </button>
        <button className="standalone-btn" onClick={@setLaterSelectedTime}>
          <FormattedMessage id='later' defaultMessage='Later' />
        </button>
      </div>
    else null

module.exports = TimeNavigationButtons
