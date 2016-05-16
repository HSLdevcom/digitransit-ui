import React, { PropTypes } from 'react';
import Icon from '../icon/icon';
import config from '../../config';
import LangSelect from './lang-select';
import { FormattedMessage } from 'react-intl';
import NotImplementedLink from '../util/not-implemented-link';

class OffcanvasMenu extends React.Component {
  static propTypes = {
    openFeedback: PropTypes.func.isRequired,
  }

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  getCreateAccountInformation = (contactName) => (
    <FormattedMessage
      id="create-account"
      values={{ contactName }}
      defaultMessage="Create {contactName} account"
    />)

  getContactInformation= (contactName) => (
    <FormattedMessage
      id="contact-information"
      values={{ contactName }}
      defaultMessage="{contactName} Contact Information"
    />)

  render() {
    const currentLanguage = this.context.getStore('PreferencesStore').getLanguage();
    const contactName = (config.contactName[currentLanguage] ?
                           config.contactName[currentLanguage] :
                           config.contactName.default);

    const inquiry = (
      <p style={{ fontSize: '20px', backgroundColor: '#888888', padding: '20px' }} >
        <a onClick={this.props.openFeedback}>
          <FormattedMessage id="inquiry" defaultMessage="Participate on inquiry" />
          <Icon img="icon-icon_arrow-right" className="small" />
        </a>
      </p>);

    const loginCreateAccount = (
      <div>
        <p className="offcanvas-lead">
          <FormattedMessage
            id="off-canvas-info"
            defaultMessage={`By logging in to this service you can restore your favourites
                            and use them on all of your devices`}
          />
        </p>
        <div className="offcanvas-login">
          <div className="inline-block">
            <Icon img="icon-icon_user" className="large" />
          </div>
          <div className="inline-block">
            <p>
              <NotImplementedLink name={this.getCreateAccountInformation(contactName)}>
                <Icon img="icon-icon_arrow-right" className="small" />
              </NotImplementedLink>
            </p>
            <p>
              <NotImplementedLink name={<FormattedMessage id="login" defaultMessage="Log in" />}>
                <Icon img="icon-icon_arrow-right" className="small" />
              </NotImplementedLink>
            </p>
          </div>
        </div>
      </div>);

    const offcanvasList = (
      <section className="offcanvas-section">
        <ul className="offcanvas-list">
          <li>
            <NotImplementedLink name={<FormattedMessage id="tickets" defaultMessage="Tickets" />} >
              <Icon img="icon-icon_arrow-right" className="small" />
            </NotImplementedLink>
          </li>
          <li>
            <NotImplementedLink name={<FormattedMessage id="routes" defaultMessage="Routes" />} >
              <Icon img="icon-icon_arrow-right" className="medium" />
            </NotImplementedLink>
          </li>
          <li>
            <NotImplementedLink name={<FormattedMessage id="stops" defaultMessage="Stops" />} >
              <Icon img="icon-icon_arrow-right" className="medium" />
            </NotImplementedLink>
          </li>
          <li>
            <NotImplementedLink
              name={<FormattedMessage id="settings" defaultMessage="Settings" />}
            >
              <Icon img="icon-icon_arrow-right" className="medium" />
            </NotImplementedLink>
          </li>
          <li>
            <NotImplementedLink
              name={<FormattedMessage id="terms-of-use" defaultMessage="Terms of Use" />}
            >
              <Icon img="icon-icon_arrow-right" className="medium" />
            </NotImplementedLink>
          </li>
          <li>
            <NotImplementedLink name={this.getContactInformation(contactName)}>
              <Icon img="icon-icon_arrow-right" className="medium" />
            </NotImplementedLink>
          </li>
        </ul>
      </section>);

    return (
      <div className="main-menu">
        <header className="offcanvas-section">
          <LangSelect />
          {config.leftMenu.showInquiry ? inquiry : void 0}
          {config.leftMenu.showLoginCreateAccount ? loginCreateAccount : void 0}
        </header>
        {config.leftMenu.showOffCanvasList ? offcanvasList : void 0}
      </div>);
  }
}

export default OffcanvasMenu;
