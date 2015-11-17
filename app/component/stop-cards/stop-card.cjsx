React                 = require 'react'
StopCardHeader        = require './stop-card-header'
Link                  = require 'react-router/lib/Link'
cx                    = require 'classnames'
NotImplementedLink    = require '../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')

class StopCard extends React.Component


  getContent: =>
    <div className={cx "card", "cursor-pointer", @props.className}>
      <StopCardHeader
        stop={@props.stop}
        favourite={@props.favourite}
        addFavouriteStop={@props.addFavouriteStop}
        distance={@props.distance}
      />
      {@props.children}
    </div>

  render: ->
    if !@props.stop || !@props.children || @props.children.length == 0
      return false

    #TODO: Implement city bike stop page, then remove this if
    if @props.cityBike
      <NotImplementedLink
        nonTextLink={true}
        name={<FormattedMessage id='citybike' defaultMessage='Citybike'/>}
        className="no-decoration"
      >
        {@getContent()}
      </NotImplementedLink>
    else
      <Link to="/pysakit/#{@props.stop.gtfsId}" className="no-decoration">
        {@getContent()}
      </Link>


module.exports = StopCard
