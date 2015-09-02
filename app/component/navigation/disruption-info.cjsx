React     = require 'react'
Modal     = require '../util/modal'
Icon      = require '../icon/icon'
moment    = require 'moment'

class DisruptionInfo extends React.Component
  @propTypes:
    open: React.PropTypes.bool
    toggleDisruptionInfo: React.PropTypes.func

  # TODO:
  # Loop the <div className='row'
  # choose: rail/bus icon
  # time format: {moment(@time).format('HH:mm')}
  render: ->
    <div>
      <Modal open={@props.open} headerText="Poikkeusinfo" toggleVisibility={@props.toggleDisruptionInfo}>
        <div className='row'>
          <section className='grid-content'>
            <div className='disruption-header warning'>
              <div className='icon center'>
                <Icon viewBox="0 0 40 40" img={'icon-icon_bus'} className='bus'/>
              </div>
              <span className='line bus bold'>2, 3 </span>
              <span className='time bold'>11:30 - 12:15</span>
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
              <span><b className='uppercase'>syy:</b> Onnettomuus</span>
              <span><b className='uppercase'>paikka:</b> Kalevalankatu</span>
              <span><b className='uppercase'>arvioitu aika:</b> 11:34 - 12:15</span>
            </div>
          </section>
        </div>
        <div className='row'>
          <section className='grid-content'>
            <div className='disruption-header warning'>
              <div className='icon center'>
                <Icon viewBox="0 0 40 40" img={'icon-icon_bus'} className='bus'/>
              </div>
              <span className='line bus bold'>2, 3 </span>
              <span className='time bold'>11:30 - 12:15</span>
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
              <span><b className='uppercase'>syy:</b> Onnettomuus</span>
              <span><b className='uppercase'>paikka:</b> Kalevalankatu</span>
              <span><b className='uppercase'>arvioitu aika:</b> 11:34 - 12:15</span>
            </div>
          </section>
        </div>
        <div className='row'>
          <section className='grid-content'>
            <div className='disruption-header warning'>
              <div className='icon center'>
                <Icon viewBox="0 0 40 40" img={'icon-icon_bus'} className='bus'/>
              </div>
              <span className='line bus bold'>2, 3 </span>
              <span className='time bold'>11:30 - 12:15</span>
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
              <span><b className='uppercase'>syy:</b> Onnettomuus</span>
              <span><b className='uppercase'>paikka:</b> Kalevalankatu</span>
              <span><b className='uppercase'>arvioitu aika:</b> 11:34 - 12:15</span>
            </div>
          </section>
        </div>
        <div className='row'>
          <section className='grid-content'>
            <div className='disruption-header warning'>
              <div className='icon center'>
                <Icon viewBox="0 0 40 40" img={'icon-icon_bus'} className='bus'/>
              </div>
              <span className='line bus bold'>2, 3 </span>
              <span className='time bold'>11:30 - 12:15</span>
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
              <span><b className='uppercase'>syy:</b> Onnettomuus</span>
              <span><b className='uppercase'>paikka:</b> Kalevalankatu</span>
              <span><b className='uppercase'>arvioitu aika:</b> 11:34 - 12:15</span>
            </div>
          </section>
        </div>
      </Modal>
    </div>

module.exports = DisruptionInfo
