import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import uniqBy from 'lodash/uniqBy';
import { Tabs, Tab } from 'material-ui/Tabs';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import SwipeableViews from 'react-swipeable-views';

import Icon from './Icon';
import MessageBarMessage from './MessageBarMessage';
import { markMessageAsRead } from '../action/MessageActions';
import { AlertContentQuery } from '../util/alertQueries';
import {
  getServiceAlertDescription,
  getServiceAlertHeader,
} from '../util/alertUtils';
import { isIe } from '../util/browser';
import hashCode from '../util/hashUtil';
import { tryGetRelayQuery } from '../util/searchUtils';
import { AlertSeverityLevelType } from '../constants';
import { getReadMessageIds } from '../store/localStorage';

/* Small version has constant height,
 * big version has max height of half but can be
 * less if the message is shorter.
 */

const fetchServiceAlerts = async () => {
  const query = Relay.createQuery(
    Relay.QL`
      query ServiceAlerts {
        viewer {
          alerts {
            ${AlertContentQuery}
          }
        }
      }
    `,
    {},
  );

  const defaultValue = [];
  const result = await tryGetRelayQuery(query, defaultValue);
  return Array.isArray(result) && result[0] && Array.isArray(result[0].alerts)
    ? result[0].alerts.filter(
        alert => alert.alertSeverityLevel === AlertSeverityLevelType.Info,
      )
    : defaultValue;
};

const getServiceAlertId = alert =>
  hashCode(
    `${alert.alertDescriptionText}-${alert.alertHeaderText}-${
      alert.alertSeverityLevel
    }-${alert.effectiveEndDate}-${alert.effectiveStartDate}`,
  );

const toMessage = alert => ({
  content: {
    en: [
      { type: 'heading', content: getServiceAlertHeader(alert, 'en') },
      { type: 'text', content: getServiceAlertDescription(alert, 'en') },
    ],
    fi: [
      { type: 'heading', content: getServiceAlertHeader(alert, 'fi') },
      { type: 'text', content: getServiceAlertDescription(alert, 'fi') },
    ],
    sv: [
      { type: 'heading', content: getServiceAlertHeader(alert, 'sv') },
      { type: 'text', content: getServiceAlertDescription(alert, 'sv') },
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
  };

  static propTypes = {
    getServiceAlertsAsync: PropTypes.func,
    lang: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
  };

  static defaultProps = {
    getServiceAlertsAsync: fetchServiceAlerts,
  };

  state = {
    slideIndex: 0,
    maximized: false,
  };

  componentDidMount = async () => {
    const { getServiceAlertsAsync } = this.props;
    const readMessageIds = getReadMessageIds();
    const serviceAlerts = (await getServiceAlertsAsync()).filter(
      alert => readMessageIds.indexOf(getServiceAlertId(alert)) === -1,
    );
    this.setState({
      ready: true,
      serviceAlerts: uniqBy(serviceAlerts, alert => alert.alertHash),
    });
  };

  getTabContent = () =>
    this.validMessages().map(el => (
      <MessageBarMessage
        key={el.id}
        onMaximize={this.maximize}
        content={el.content[this.props.lang] || el.content.fi}
      />
    ));

  // TODO: This is a hack to get around the hard-coded height in material-ui Tab component
  getTabMarker = (i, isSelected, isDisruption) => {
    const colorSet = isDisruption ? ['inherit', 'white'] : ['#007ac9', '#ddd'];
    return (
      <span
        style={{
          color: colorSet[isSelected ? 0 : 1],
          height: '18px',
          position: 'absolute',
        }}
        title={`${this.context.intl.formatMessage({
          id: 'messagebar-label-page',
          defaultMessage: 'Page',
        })} ${i + 1}`}
      >
        •
      </span>
    );
  };

  getTabs = (selectedIndex, isDisruption) => {
    const messages = this.validMessages();
    return messages.map((el, i) => {
      const isSelected = i === selectedIndex;
      return (
        <Tab
          key={el.id}
          selected={isSelected}
          icon={
            messages.length > 1
              ? this.getTabMarker(i, isSelected, isDisruption)
              : null
          }
          value={i}
          style={{
            margin: '2px 0 0 0',
            maxWidth: '30px',
          }}
          buttonStyle={{
            height: '18px',
          }}
        />
      );
    });
  };

  maximize = () => {
    this.setState({ maximized: true });
  };

  validMessages = () => {
    const { serviceAlerts } = this.state;
    const { lang, messages } = this.props;
    return [...serviceAlerts.map(toMessage), ...messages].filter(el => {
      if (
        Array.isArray(el.content[lang]) &&
        el.content[lang].length > 0 &&
        el.content[lang][0].content
      ) {
        return true;
      }
      /* eslint-disable no-console */
      console.error(`Message ${el.id} has no translation for ${lang}`);
      /* eslint-enable no-console */
      return false;
    });
  };

  handleChange = value => {
    this.setState({ slideIndex: value });
  };

  handleClose = () => {
    const messages = this.validMessages();
    let index = this.state.slideIndex;
    const msgId = messages[index].id;

    // apply delayed closing on iexplorer to avoid app freezing
    const t = isIe ? 600 : 0;
    setTimeout(() => this.context.executeAction(markMessageAsRead, msgId), t);

    // slideIndex needs to be updated
    if (index > 0) {
      index -= 1;
      this.handleChange(index);
    }
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
    const iconName = `icon-icon_${icon}`;
    const isDisruption = msg.type === 'disruption';

    return (
      <section
        id="messageBar"
        role="banner"
        className="message-bar flex-horizontal"
      >
        <div
          className={cx('banner-container', {
            'banner-disruption': isDisruption,
          })}
        >
          <Icon img={iconName} className="message-icon" />
          <div className={`message-bar-content message-bar-${type}`}>
            <SwipeableViews
              index={index}
              onChangeIndex={this.handleChange}
              className={!maximized ? 'message-bar-fade' : ''}
              containerStyle={{
                maxHeight: maximized ? '400px' : '100px',
                transition: 'max-height 300ms',
              }}
              slideStyle={{
                maxHeight: maximized ? '400px' : '100px',
                transition: 'max-height 300ms',
                padding: '10px 10px 0px 10px',
                overflow: 'hidden',
                background: isDisruption ? 'inherit' : '#fff',
              }}
            >
              {this.getTabContent()}
            </SwipeableViews>
            <Tabs
              onChange={this.handleChange}
              value={index}
              tabItemContainerStyle={{
                backgroundColor: isDisruption ? 'inherit' : '#fff',
                height: '18px',
                justifyContent: 'center',
              }}
              inkBarStyle={{ display: 'none' }}
            >
              {this.getTabs(slideIndex, isDisruption)}
            </Tabs>
          </div>
          <div>
            <button
              id="close-message-bar"
              title={this.context.intl.formatMessage({
                id: 'messagebar-label-close-message-bar',
                defaultMessage: 'Close banner',
              })}
              onClick={this.handleClose}
              className="noborder close-button cursor-pointer"
              type="button"
            >
              <Icon img="icon-icon_close" className="close" />
            </button>
          </div>
        </div>
      </section>
    );
  }
}

const connectedComponent = connectToStores(
  MessageBar,
  ['MessageStore', 'PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
    messages: context.getStore('MessageStore').getMessages(),
  }),
);

export { connectedComponent as default, MessageBar as Component };
