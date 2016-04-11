React = require 'react'

class PiwikProvider extends React.Component
  @childContextTypes:
    piwik: React.PropTypes.object.isRequired

  getChildContext: () ->
    piwik: @props.piwik

  render: ->
    React.Children.only(@props.children)

module.exports = PiwikProvider
