React     = require 'react'
Modal     = require '../util/modal'
Icon      = require '../icon/icon'
moment    = require 'moment'

class DisruptionInfo extends React.Component
  # porps:
  # open (boolean)
  # toggleDisruptionInfo()
  @propTypes:
    toggleDisruptionInfo: React.PropTypes.func

  # TODO:
  # for loop the sections
  # rail/bus icon
  # time stuff: {moment(@props.endTime).format('HH:mm')}
  render: ->
    <Modal open={@props.open} toggleVisibility={@props.toggleDisruptionInfo}>
      <h3>Poikkeusinfo</h3>

      <div className='row'>
        <section className='grid-content'>
          <div className='disruption-header warning'>
            <div className='icon center'>
              <Icon viewBox="0 0 40 40" img={'icon-icon_bus'} className='bus'/>
            </div>
            <span className='line bus'>2, 3 </span>
            <span className='time'>11:30 - 12:15</span>
          </div>
          <div className='disruption-content'>
            <p>
              Ham hock spare ribs bacon flank short loin, alcatra drumstick chuck.
            </p>
            <p>
              Beef jowl boudin meatloaf tenderloin frankfurter sirloin.
            </p>
          </div>
          <div className='disruption-details'>
            <span><b>SYY:</b> Onnettomuus</span>
            <span><b>PAIKKA:</b> Kalevalankatu</span>
            <span><b>ARVIOITU AIKA:</b> 11:34 - 12:15</span>
          </div>
        </section>
      </div>
    </Modal>

module.exports = DisruptionInfo
