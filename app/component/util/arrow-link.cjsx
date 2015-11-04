React = require 'react'
Icon  = require '../icon/icon'
Link  = require 'react-router/lib/Link'
cx = require 'classnames'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

ArrowLink = (props) ->
  <Link to={props.to}>
    <Icon img={'icon-icon_arrow-right'} className={cx props.className}/>
    {props.children}
  </Link>

ArrowLink.description =
  "Icon of right-arrow that is a clickable link. One must
  give a link url as prop to use it"

ArrowLink.propTypes =
  to: React.PropTypes.string.isRequired
  className: React.PropTypes.string

ArrowLink.displayName = "ArrowLink"

module.exports = ArrowLink
