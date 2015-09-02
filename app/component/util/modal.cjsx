React = require 'react'
cx    = require 'classnames'
Icon  = require '../icon/icon'

class Modal extends React.Component
  # props:
  # open (boolean)
  # toggleVisibility()

  @propTypes:
    toggleVisibility: React.PropTypes.func

  @defaultProps:
    overlay: true

  # makes it possible to press the modal
  stopClickPropagation: (e) ->
    e.preventDefault()
    e.stopPropagation()

  render: ->
    isActive =
      'is-active': this.props.open

    modalClasses =
      'modal': true
      'small-11': true
      'column': true


    overlayStyle = {};
    if (!this.props.overlay)
      overlayStyle.background = 'transparent';

    <div className={cx('modal-overlay', isActive)} style={overlayStyle} onTouchTap={@props.toggleVisibility} >
      <div id={this.props.id} data-closable={true} className={cx(modalClasses, isActive)} onTouchTap={this.stopClickPropagation}>
        <div className='row'>
          <div className='small-1 columns right text-right modal-top-nav'>
            <a onTouchTap={this.props.toggleVisibility} className="close-button">
              <Icon img={'icon-icon_close'}/>
            </a>
          </div>
        </div>
        {this.props.children}
      </div>
    </div>


module.exports = Modal;
