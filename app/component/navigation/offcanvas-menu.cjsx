React      = require 'react'
Icon       = require '../icon/icon'
config     = require '../../config'
LangSelect = require './lang-select'
FormattedMessage = require('react-intl').FormattedMessage
NotImplementedLink = require '../util/not-implemented-link'
class OffcanvasMenu extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  render: ->
    currentLanguage = @context.getStore('PreferencesStore').getLanguage()
    contactName = if config.contactName[currentLanguage] then config.contactName[currentLanguage] else config.contactName.default

    <div className="left-off-canvas">
      <header className="offcanvas-section">
        <LangSelect/>
        <p style={'fontSize': '20px', 'backgroundColor': '#888888', 'padding': '20px'}>
          <a onClick={@props.openFeedback} ><FormattedMessage id="inquiry" defaultMessage="Participate on inquiry"/> <Icon img={'icon-icon_arrow-right'} className="small"/></a>
        </p>
        <p className="offcanvas-lead">
          <FormattedMessage id="off-canvas-info" defaultMessage="By loggin in to this service you can restore your favourites and use them on all of your devices"/>
        </p>
        <div className="offcanvas-login">
          <div className="inline-block">
            <Icon img={'icon-icon_user'} className="large"/>
          </div>
          <div className="inline-block">
            <p>
              <NotImplementedLink
                name={@getCreateAccountInformation(contactName)}>
                &nbsp;<Icon img={'icon-icon_arrow-right'} className="small"/>
              </NotImplementedLink>
            </p>
            <p>
              <NotImplementedLink name={<FormattedMessage id="login" defaultMessage="Login"/>}> <Icon img={'icon-icon_arrow-right'} className="small"/></NotImplementedLink>
            </p>
          </div>
        </div>
      </header>

      <section className="offcanvas-section">
        <ul className="offcanvas-list">
          <li><NotImplementedLink name={<FormattedMessage id="tickets" defaultMessage="Tickets"/>}> <Icon img={'icon-icon_arrow-right'} className="small"/></NotImplementedLink></li>
          <li><NotImplementedLink name={<FormattedMessage id="routes" defaultMessage="Routes"/>}> <Icon img={'icon-icon_arrow-right'} className="medium"/></NotImplementedLink></li>
          <li><NotImplementedLink name={<FormattedMessage id="stops" defaultMessage="Stops"/>}> <Icon img={'icon-icon_arrow-right'} className="medium"/></NotImplementedLink></li>
          <li><NotImplementedLink name={<FormattedMessage id="settings" defaultMessage="Settings"/>}> <Icon img={'icon-icon_arrow-right'} className="medium"/></NotImplementedLink></li>
          <li><NotImplementedLink name={<FormattedMessage id="terms-of-use" defaultMessage ="Terms of Use"/>}> <Icon img={'icon-icon_arrow-right'} className="medium"/></NotImplementedLink></li>
          <li>
            <NotImplementedLink name={@getContactInformation(contactName)}>
              &nbsp;<Icon img={'icon-icon_arrow-right'} className="medium"/>
            </NotImplementedLink>
          </li>
        </ul>
      </section>
    </div>

  getCreateAccountInformation: (contactName) =>
    <FormattedMessage
      id="create-account"
      values={{
        contactName: contactName}}
      defaultMessage="Create {contactName} account"/>

  getContactInformation: (contactName) =>
    <FormattedMessage
      id="contact-information"
      values={{
        contactName: contactName}}
      defaultMessage="{contactName} Contact Information"/>

module.exports = OffcanvasMenu
