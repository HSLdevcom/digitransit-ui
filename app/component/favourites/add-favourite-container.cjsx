React                 = require 'react'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'
Link                  = require 'react-router/lib/Link'
{FormattedMessage}    = require('react-intl')

class AddFavouriteContainer extends React.Component

  render: ->
    <div className={cx @props.className, "add-favourite-container"}>
      <Link to="/" className="right cursor-pointer">
        <Icon id="add-favourite-close-icon" img={'icon-icon_close'}/>
      </Link>
      <header className={"add-favourite-container__header row"}>
        <div className="cursor-pointer add-favourite-star small-1 columns">
          <Icon className={cx "add-favourite-star__icon", "selected"} img="icon-icon_star"/>
        </div>
        <div className="add-favourite-container__header-text small-11 columns">
          <h3><FormattedMessage id="add-location-to-favourites" defaultMessage="Add a location to your favourites tab"/></h3>
        </div>
      </header>
    </div>


module.exports = AddFavouriteContainer
