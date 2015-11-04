React = require 'react'
Icon  = require '../icon/icon'
Link  = require 'react-router/lib/Link'
cx = require 'classnames'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage


class ArrowLink extends React.Component

  @propTypes:
    to: React.PropTypes.string.isRequired
    className: React.PropTypes.string

  render: ->
    <Link to={@props.to}>
      <Icon img={'icon-icon_arrow-right'} className={cx @props.className}/>
      {@props.children}
    </Link>

  @description =
    "Icon of right-arrow that is a clickable link. One must
    give a link url as prop to use it"

  @displayName = "ArrowLink"

module.exports = ArrowLink
