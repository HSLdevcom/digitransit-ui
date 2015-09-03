React       = require 'react'
Icon        = require '../icon/icon'
Offcanvas   = require '../util/offcanvas'

class OffcanvasCustomize extends React.Component
  @propTypes:
    open: React.PropTypes.bool

  render: ->
    <Offcanvas open={@props.open} className="offcanvas-customize" position="right">
      <div className="container">
        <div className="row">
          <div className="small-2 small-offset-1 columns">
            <a href="#"><Icon img={'icon-icon_arrow-right'}/></a>
          </div>
          <div className="small-2 columns">
            <a className="">z</a>
          </div>
          <div className="small-2 columns">
            <a className="">a</a>
          </div>
          <div className="small-2 columns">
            <a className="">t</a>
          </div>
          <div className="small-2 columns end">
            <a className="">x</a>
          </div>
        </div>
      </div>

      <section className="offcanvas-section">
        <div className="row">
          asdsadasdads
        </div>
      </section>
    </Offcanvas>

module.exports = OffcanvasCustomize
