React                 = require 'react'
Icon                  = require '../icon/icon'
Offcanvas             = require '../util/offcanvas'
CustomizeSearch       = require './customize-search'


class CustomizeSearchContainer extends React.Component
  @propTypes:
    open: React.PropTypes.bool


  render: ->
    <Offcanvas open={@props.open} className="customize-search" position="right">
      <CustomizeSearch/>
    </Offcanvas>



module.exports = CustomizeSearchContainer
