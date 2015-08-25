React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Icon                  = require '../icon/icon.cjsx'
Link                  = require('react-router/lib/Link').Link
classNames            = require 'classnames'


class StopCardHeader extends React.Component
  getInfoIcon: ->
    <Link to="#{process.env.ROOT_PATH}pysakit/#{@props.stop.gtfsId}/info">
      <span className="cursor-pointer">
        <Icon className="info" img="icon-icon_info"/>
      </span>
    </Link>

  getDescription: ->
    description = ""
    if @props.stop.desc
      description += @props.stop.desc + " // "
    if @props.stop.code
      description += @props.stop.code + " // "
    if @props.dist
      description += Math.round(@props.dist) + " m"
    description

  render: ->
    # We use onClick in the following, as it is rendered sometimes in a popup, in which the touch tap event does not fire (as it is part of another react render)
    <div className={classNames "stop-card-header", @props.className}>
      <span className="cursor-pointer favourite-icon" onClick={@props.addFavouriteStop}>
        <Icon className={classNames "favourite", selected: @props.favourite} img="icon-icon_star"/>
      </span>
      {if @props.infoIcon then @getInfoIcon()}
      <h3>{@props.stop.name} ›</h3>
      <p className="location">{@getDescription()}</p>
    </div>

module.exports = Relay.createContainer(StopCardHeader, fragments: queries.StopCardHeaderFragments)
