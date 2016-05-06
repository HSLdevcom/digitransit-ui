React              = require 'react'
Icon               = require '../icon/icon'
cx                 = require 'classnames'
{FormattedMessage} = require 'react-intl'

class CurrentPositionSuggestionItem extends React.Component

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired

  componentWillMount: =>
    @context.getStore('PositionStore').addChangeListener @onPositionChange

  componentWillUnmount: =>
    @context.getStore('PositionStore').removeChangeListener @onPositionChange

  onPositionChange: (payload) =>
    if payload.statusChanged
      @forceUpdate()

  render: =>
    havePosition = @context.getStore('PositionStore').getLocationState()?.lat > 0
    <span className={cx "search-result", @props.item.type}>
      {
        if havePosition
          <span>
            <span className="autosuggestIcon">
              <Icon img="icon-icon_position" className={cx "havePosition"}/>
            </span>
            <FormattedMessage id='use-own-position' defaultMessage='Use Your current location' />
          </span>
        else
          <span>
            <span className="autosuggestIcon">
              <Icon img="icon-icon_position" className={cx "noPosition"}/>
            </span>
            <FormattedMessage id='use-own-position' defaultMessage='Use Your current location' /> - <span className="search-position"><FormattedMessage id='search-position' defaultMessage='Locate' /></span>
          </span>
      }
    </span>

module.exports = CurrentPositionSuggestionItem
