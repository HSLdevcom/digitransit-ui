React = require 'react'
Icon  = require '../icon/icon'
cx    = require 'classnames'

class AddFavouriteContainer extends React.Component

  render: ->
    <div className={cx @props.className, "add-favourite-container"}>
      <a className="right cursor-pointer" href="/">
        <Icon id="add-favourite-close-icon" img={'icon-icon_close'}/>
      </a>
    </div>


module.exports = AddFavouriteContainer
