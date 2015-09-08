React           = require 'react'
Icon            = require '../icon/icon'
Offcanvas       = require '../util/offcanvas'
Slider          = require '../util/slider'

class OffcanvasCustomize extends React.Component
  @propTypes:
    open: React.PropTypes.bool

  constructor: ->
    @state = sliderWalk: 50

  walkOnChange: ->
    @setState
      sliderWalk: event.target.value
    console.log event.target.value

  render: ->
    <Offcanvas open={@props.open} className="offcanvas-customize" position="right">
      <section className="offcanvas-section">
        <div className="row btn-bar">
          <div className="bus btn first-btn columns-5 columns">
            <div className="icon-holder cursor-pointer">
              <Icon img={'icon-icon_bus-withoutBox'} className="" />
            </div>
          </div>
          <div className="tram btn columns-5 columns">
            <div className="icon-holder cursor-pointer">
              <Icon img={'icon-icon_tram-withoutBox'} className="" />
            </div>
          </div>
          <div className="btn columns-5 columns">
            <div className="icon-holder cursor-pointer">
              <Icon img={'icon-icon_rail-withoutBox'} className="" />
            </div>
          </div>
          <div className="subway btn columns-5 columns">
            <div className="icon-holder cursor-pointer">
              <Icon img={'icon-icon_subway-withoutBox'} className="" />
            </div>
          </div>
          <div className="btn last-btn columns-5 columns">
            <div className="icon-holder cursor-pointer">
              <Icon img={'icon-icon_ferry-withoutBox'} className="" />
            </div>
          </div>
        </div>
        <p></p>
        <div className="row btn-bar">
          <div className="btn checked first-btn small-4 columns">
            <div className="icon-holder cursor-pointer">
              <Icon img={'icon-icon_walk'} className="" />
            </div>
          </div>
          <div className="btn small-4 columns">
            <div className="icon-holder cursor-pointer">
              <Icon img={'icon-icon_cycle'} className="" />
            </div>
          </div>
          <div className="btn last-btn small-4 columns">
            <div className="icon-holder cursor-pointer">
              <Icon img={'icon-icon_car'} className="" />
            </div>
          </div>
        </div>
      </section>


      <section className="offcanvas-section">

        <Slider
          headerText={"Kävely"}
          onSliderChange={@walkOnChange}
          minText={"Vähän kävelyä"}
          maxText={"Suosi kävelyä"}
        />
      </section>
    </Offcanvas>



module.exports = OffcanvasCustomize
