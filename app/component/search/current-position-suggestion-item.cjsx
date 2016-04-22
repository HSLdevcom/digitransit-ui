React          = require 'react'
Icon           = require '../icon/icon'
cx             = require 'classnames'
{FormattedMessage} = require 'react-intl'

class CurrentPositionSuggestionItem extends React.Component

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired

  componentWillMount: =>
    @context.getStore('SearchStore').addChangeListener @onSearchChange

  componentWillUnmount: =>
    @context.getStore('SearchStore').removeChangeListener @onSearchChange

  onSearchChange: (payload) =>
    if payload.action == "suggestions"
      @setState "suggestions": payload.data, focusedItemIndex: 0,
        () => focusItem(0)

  render: =>
    <span className={cx "search-result", @props.item.type}>
      <span className={@props.spanClass || ""}>
        <Icon img="icon-icon_position" className={@props.iconClass || ""}/>
      </span>
      <FormattedMessage id='own-position' defaultMessage='Your current location' />
    </span>

module.exports = CurrentPositionSuggestionItem
