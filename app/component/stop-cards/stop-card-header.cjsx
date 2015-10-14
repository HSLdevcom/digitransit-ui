React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/Link'
classNames            = require 'classnames'
NotImplemented        = require('../util/not-implemented')

class StopCardHeader extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  getInfoIcon: ->
    <a href="#{process.env.ROOT_PATH}pysakit/#{@props.stop.gtfsId}/info" onClick={NotImplemented.onClick(@context, 'info')}>
      <span className="cursor-pointer">
        <Icon className="info right" img="icon-icon_info"/>
      </span>
    </a>

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
    <div className={classNames "card-header", @props.className}>
      <span className="cursor-pointer favourite-icon right" onClick={@props.addFavouriteStop}>
        <Icon className={classNames "favourite", selected: @props.favourite} img="icon-icon_star"/>
      </span>
      {if @props.infoIcon then @getInfoIcon()}
      <span className={@props.headingStyle || "h4"}>{@props.stop.name} ›</span>
      <p className="sub-header-h4">{@getDescription()}</p>
    </div>

module.exports = Relay.createContainer(StopCardHeader, fragments: queries.StopCardHeaderFragments)
