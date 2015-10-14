React      = require 'react'
Icon       = require '../icon/icon'
Offcanvas  = require '../util/offcanvas'
LangSelect = require './lang-select'
FormattedMessage = require('react-intl').FormattedMessage
NotImplemented = require('../util/not-implemented')

class OffcanvasMenu extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  render: ->
    <Offcanvas open={@props.open} position="left">
      <header className="offcanvas-header offcanvas-section">
        <LangSelect/>
        <p className="offcanvas-lead">
          <FormattedMessage id="off-canvas-info" defaultMessage="By loggin in to this service you can restore your favourites and use them on all of your devices"/>
        </p>
        <div className="offcanvas-login">
          <div className="inline-block">
            <Icon img={'icon-icon_user'} className="large"/>
          </div>
          <div className="inline-block">
            <p>
              <a href="#" onClick={NotImplemented.onClick(@context, 'create-account')}><FormattedMessage id="create-account" defaultMessage="Create account"/> <Icon img={'icon-icon_arrow-right'} className="small"/></a>
            </p>
            <p>
              <a href="#" onClick={NotImplemented.onClick(@context, 'login')}><FormattedMessage id="login" defaultMessage="Log in"/> <Icon img={'icon-icon_arrow-right'} className="small"/></a>
            </p>
          </div>
        </div>
      </header>

      <section className="offcanvas-section">
        <ul className="offcanvas-list">
          <li><a href="#" onClick={NotImplemented.onClick(@context, 'tickets')} ><FormattedMessage id="tickets" defaultMessage="Tickets"/> <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#" onClick={NotImplemented.onClick(@context, 'routes')}><FormattedMessage id="routes" defaultMessage="Routes"/> <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#" onClick={NotImplemented.onClick(@context, 'stops')}><FormattedMessage id="stops" defaultMessage="Stops"/> <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#" onClick={NotImplemented.onClick(@context, 'settings')}><FormattedMessage id="settings" defaultMessage="Settings"/> <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#" onClick={NotImplemented.onClick(@context, 'terms-of-use')}><FormattedMessage id="terms-of-use" defaultMessage="Terms of Use"/> <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#" onClick={NotImplemented.onClick(@context, 'hsl-contact-information')}><FormattedMessage id="hsl-contact-information" defaultMessage="HSL Contacts"/> <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
        </ul>
      </section>
    </Offcanvas>



module.exports = OffcanvasMenu
