import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { intlShape } from 'react-intl';
import { graphql, fetchQuery, ReactRelayContext } from 'react-relay';
import { v4 as uuid } from 'uuid';

import Icon from './Icon';
import MessageBarMessage from './MessageBarMessage';
import { markMessageAsRead } from '../action/MessageActions';
import { getReadMessageIds } from '../store/localStorage';
import {
  getServiceAlertDescription,
  getServiceAlertHeader,
  getServiceAlertUrl,
} from '../util/alertUtils';
import { isIe } from '../util/browser';
import hashCode from '../util/hashUtil';

/* Small version has constant height,
 * big version has max height of half but can be
 * less if the message is shorter.
 */

const fetchServiceAlerts = async (feedids, relayEnvironment) => {
  const query = graphql`
    query MessageBarQuery($feedids: [String!]) {
      alerts: alerts(severityLevel: [SEVERE], feeds: $feedids) {
        id
        alertDescriptionText
        alertHash
        alertHeaderText
        alertSeverityLevel
        alertUrl
        effectiveEndDate
        effectiveStartDate
        alertDescriptionTextTranslations {
          language
          text
        }
        alertHeaderTextTranslations {
          language
          text
        }
        alertUrlTranslations {
          language
          text
        }
      }
    }
  `;

  const result = await fetchQuery(relayEnvironment, query, { feedids });
  return result && Array.isArray(result.alerts) ? result.alerts : [];
};

export const getServiceAlertId = alert =>
  hashCode(
    `${alert.alertDescriptionText}
     ${alert.alertHeaderText}
     ${alert.alertSeverityLevel}
     ${alert.effectiveEndDate}
     ${alert.effectiveStartDate}`,
  );

const toMessage = (alert, intl) => ({
  content: {
    en: [
      { type: 'heading', content: getServiceAlertHeader(alert, 'en') },
      { type: 'text', content: getServiceAlertDescription(alert, 'en') },
      {
        type: 'a',
        content: intl.formatMessage({ id: 'extra-info' }),
        href: getServiceAlertUrl(alert, 'en'),
      },
    ],
    fi: [
      { type: 'heading', content: getServiceAlertHeader(alert, 'fi') },
      { type: 'text', content: getServiceAlertDescription(alert, 'fi') },
      {
        type: 'a',
        content: intl.formatMessage({ id: 'extra-info' }),
        href: getServiceAlertUrl(alert, 'fi'),
      },
    ],
    sv: [
      { type: 'heading', content: getServiceAlertHeader(alert, 'sv') },
      { type: 'text', content: getServiceAlertDescription(alert, 'sv') },
      {
        type: 'a',
        content: intl.formatMessage({ id: 'extra-info' }),
        href: getServiceAlertUrl(alert, 'sv'),
      },
    ],
  },
  icon: 'caution',
  id: getServiceAlertId(alert),
  persistence: 'repeat',
  type: 'disruption',
});

class MessageBar extends Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    currentTime: PropTypes.number.isRequired,
    getServiceAlertsAsync: PropTypes.func,
    lang: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
    relayEnvironment: PropTypes.object,
    mobile: PropTypes.bool,
  };

  static defaultProps = {
    getServiceAlertsAsync: fetchServiceAlerts,
    mobile: false,
  };

  state = {
    slideIndex: 0,
    maximized: false,
  };

  componentDidMount = async () => {
    const { currentTime, getServiceAlertsAsync, relayEnvironment } = this.props;
    const { config } = this.context;

    const feedIds =
      Array.isArray(config.feedIds) && config.feedIds.length > 0
        ? config.feedIds
        : null;
    if (config.messageBarAlerts) {
      this.setState({
        ready: true,
        serviceAlerts: uniqBy(
          (await getServiceAlertsAsync(feedIds, relayEnvironment)).filter(
            alert =>
              alert.effectiveStartDate <= currentTime &&
              alert.effectiveEndDate >= currentTime,
          ),
          alert => alert.alertHash,
        ),
      });
    } else {
      this.setState({
        ready: true,
        serviceAlerts: [],
      });
    }
  };

  ariaContent = content => {
    return (
      <span key={uuid()}>
        {content.map(e => (
          <span key={uuid()}>{e.content}</span>
        ))}
      </span>
    );
  };

  getTabContent = textColor =>
    this.validMessages().map(el => (
      <MessageBarMessage
        key={el.id}
        onMaximize={this.maximize}
        content={el.content[this.props.lang] || el.content.fi}
        textColor={textColor}
      />
    ));

  maximize = () => {
    this.setState({ maximized: true });
  };

  validMessages = () => {
    const { serviceAlerts } = this.state;
    const { intl } = this.context;

    const readMessageIds = getReadMessageIds();
    const filteredServiceAlerts = serviceAlerts.filter(
      alert => readMessageIds.indexOf(getServiceAlertId(alert)) === -1,
    );
    const { lang, messages } = this.props;
    return [
      ...filteredServiceAlerts.map(alert => toMessage(alert, intl)),
      ...messages,
    ].filter(el => {
      if (
        Array.isArray(el.content[lang]) &&
        el.content[lang].length > 0 &&
        el.content[lang][0].content
      ) {
        return true;
      }
      return false;
    });
  };

  handleClose = () => {
    const messages = this.validMessages();
    const index = this.state.slideIndex;
    const msgId = messages[index].id;

    // apply delayed closing on iexplorer to avoid app freezing
    const t = isIe ? 600 : 0;
    setTimeout(() => this.context.executeAction(markMessageAsRead, msgId), t);
  };

  render() {
    const { maximized, ready, slideIndex } = this.state;
    if (!ready) {
      return null;
    }
    const messages = this.validMessages();
    if (messages.length === 0) {
      return null;
    }

    const index = Math.min(slideIndex, messages.length - 1);
    const msg = messages[index];
    const type = msg.type || 'info';
    const icon = msg.icon || 'info';
    // eslint-disable-next-line prefer-destructuring
    const iconColor = msg.iconColor;
    const iconName = `icon-icon_${icon}`;
    const isDisruption = msg.type === 'disruption';
    const backgroundColor = msg.backgroundColor || '#fff';
    const textColor = isDisruption ? '#fff' : msg.textColor || '#000';
    const dataURI = msg.dataURI || null;
    return (
      <>
        <span className="sr-only" role="alert">
          {this.validMessages().map(el =>
            this.ariaContent(el.content[this.props.lang] || el.content.fi),
          )}
        </span>
        <section
          id="messageBar"
          role="banner"
          aria-hidden="true"
          className={cx(
            'message-bar',
            { 'mobile-bar ': this.props.mobile },
            'flex-horizontal',
          )}
          style={{ background: backgroundColor }}
        >
          <div
            className={cx('banner-container', {
              'banner-disruption': isDisruption,
            })}
          >
            <Icon
              img={iconName}
              color={iconColor}
              dataURI={dataURI}
              className="message-icon"
            />
            <div className={`message-bar-content message-bar-${type}`}>
              <div className={!maximized ? 'message-bar-fade' : ''}>
                <div className={`message-bar-container ${maximized}`}>
                  <div
                    style={{
                      background: isDisruption ? 'inherit' : backgroundColor,
                    }}
                  >
                    {this.getTabContent(textColor)}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <button
                id="close-message-bar"
                title={this.context.intl.formatMessage({
                  id: 'messagebar-label-close-message-bar',
                  defaultMessage: 'Close banner',
                })}
                onClick={this.handleClose}
                className="noborder close-button  cursor-pointer"
                type="button"
              >
                <Icon img="icon-icon_close" className="close" color="#333333" />
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }
}

const connectedComponent = connectToStores(
  props => (
    <ReactRelayContext.Consumer>
      {({ environment }) => (
        <MessageBar {...props} relayEnvironment={environment} />
      )}
    </ReactRelayContext.Consumer>
  ),
  ['MessageStore', 'PreferencesStore', 'TimeStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
    messages: context.getStore('MessageStore').getMessages(),
    currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
  }),
);

export { connectedComponent as default, MessageBar as Component };
