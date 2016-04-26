React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Icon                  = require '../icon/icon'
Link                  = require 'react-router/lib/Link'
cx                    = require 'classnames'
NotImplementedLink    = require '../util/not-implemented-link'
CardHeader            = require '../card/card-header'
config                = require '../../config'

class StopCardHeader extends React.Component

  getInfoIcon: ->
    <NotImplementedLink href="/pysakit/#{@props.stop.gtfsId}/info" name="info" nonTextLink={true}>
      <span className="cursor-pointer">
        <Icon className="info right" img="icon-icon_info"/>
      </span>
    </NotImplementedLink>

  getDescription: ->
    description = ""
    if config.stopCard.header.showDescription and @props.stop.desc
      description += @props.stop.desc + " // "
    if config.stopCard.header.showStopCode and @props.stop.code
      description += @props.stop.code + " // "
    if config.stopCard.header.showDistance and @props.distance
      description += Math.round(@props.distance) + " m"
    description

  render: ->
    <CardHeader
      addFavourite={@props.addFavouriteStop}
      className={@props.className}
      favourite={@props.favourite}
      headingStyle={@props.headingStyle}
      name={@props.stop.name}
      description={@getDescription()}
    >
      {if @props.infoIcon then @getInfoIcon()}
    </CardHeader>


module.exports = Relay.createContainer(StopCardHeader, fragments: queries.StopCardHeaderFragments)
