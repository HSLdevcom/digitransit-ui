React = require 'react'
Icon  = require '../icon/icon'
cx    = require 'classnames'
Link  = require 'react-router/lib/Link'

class AddFavouriteContainer extends React.Component

  render: ->
    <div className={cx @props.className, "add-favourite-container"}>
      <Link to="/" className="right cursor-pointer">
        <Icon id="add-favourite-close-icon" img={'icon-icon_close'}/>
      </Link>
    </div>


module.exports = AddFavouriteContainer
