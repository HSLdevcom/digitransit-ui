React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/Link'
cx                    = require 'classnames'
NotImplementedLink    = require('../util/not-implemented-link')

class StopCardHeader extends React.Component

  getInfoIcon: ->
    <NotImplementedLink href="#{process.env.ROOT_PATH}pysakit/#{@props.stop.gtfsId}/info" name="info">
      <span className="cursor-pointer">
        <Icon className="info right" img="icon-icon_info"/>
      </span>
    </NotImplementedLink>

  getDescription: ->
    description = ""
    if @props.stop.desc
      description += @props.stop.desc + " // "
    if @props.stop.code
      description += @props.stop.code + " // "
    if @props.distance
      description += Math.round(@props.distance) + " m"
    description

  render: ->
    <div className={cx "card-header", @props.className}>
      <span className="cursor-pointer favourite-icon right" onClick={@props.addFavouriteStop}>
        <Icon className={cx "favourite", selected: @props.favourite} img="icon-icon_star"/>
      </span>
      {if @props.infoIcon then @getInfoIcon()}
      <span className={@props.headingStyle || "h4"}>{@props.stop.name} ›</span>
      <p className="sub-header-h4">{@getDescription()}</p>
    </div>

module.exports = Relay.createContainer(StopCardHeader, fragments: queries.StopCardHeaderFragments)
