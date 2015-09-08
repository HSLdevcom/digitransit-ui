React = require 'react'
cx    = require 'classnames'
Icon  = require '../icon/icon'

class Modal extends React.Component
  @propTypes:
    open: React.PropTypes.bool
    toggleVisibility: React.PropTypes.func
    headerText: React.PropTypes.string

  @defaultProps:
    overlay: true

  # makes it possible to press the modal without closing it
  stopClickPropagation: (e) ->
    e.preventDefault()
    e.stopPropagation()

  render: ->
    isActive =
      'is-active': @props.open

    modalClasses =
      'modal': true
      'small-11': true
      'column': true


    overlayStyle = {};
    if (!@props.overlay)
      overlayStyle.background = 'transparent';

    <div className={cx('modal-overlay', isActive)} style={overlayStyle} onTouchTap={@props.toggleVisibility} >
      <div id={@props.id} data-closable={true} className={cx(modalClasses, isActive)} onTouchTap={@stopClickPropagation}>
        <div className='row'>
          <h2>{@props.headerText}</h2>
          <div className='small-1 columns right text-right modal-top-nav'>
            <a onTouchTap={@props.toggleVisibility} className="close-button">
              <Icon img={'icon-icon_close'}/>
            </a>
          </div>
        </div>
        <div className='modal-wrapper'>
          <div className='modal-content'>
            {@props.children}
          </div>
        </div>
      </div>
    </div>


module.exports = Modal;
