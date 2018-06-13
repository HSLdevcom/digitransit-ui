import PropTypes from 'prop-types';
import React, { Component } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import SwipeableViews from 'react-swipeable-views';
import { Tabs, Tab } from 'material-ui/Tabs';
import { intlShape } from 'react-intl';
import { markMessageAsRead } from '../action/MessageActions';
import { isIe } from '../util/browser';

import Icon from './Icon';
import MessageBarMessage from './MessageBarMessage';

/* Small version has constant height,
 * big version has max height of half but can be
 * less if the message is shorter.
 */

class MessageBar extends Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  static propTypes = {
    lang: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
  };

  state = {
    slideIndex: 0,
    maximized: false,
  };

  componentDidMount = () => this.setState({ ready: true });

  getTabContent = () =>
    this.validMessages().map(el => (
      <MessageBarMessage
        key={el.id}
        onMaximize={this.maximize}
        content={el.content[this.props.lang] || el.content.fi}
      />
    ));

  // TODO: This is a hack to get around the hard-coded height in material-ui Tab component
  getTabMarker = i => (
    <span
      style={{
        color: i === this.state.slideIndex ? '#007ac9' : '#ddd',
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

  getTabs = () => {
    const messages = this.validMessages();
    return messages.map((el, i) => (
      <Tab
        key={el.id}
        selected={i === this.state.slideIndex}
        icon={messages.length > 1 ? this.getTabMarker(i) : null}
        value={i}
        style={{
          margin: '2px 0 0 0',
        }}
        buttonStyle={{
          height: '18px',
        }}
      />
    ));
  };

  maximize = () => {
    this.setState({ maximized: true });
  };

  validMessages = () =>
    this.props.messages.filter(el => {
      if (
        Array.isArray(el.content[this.props.lang]) &&
        el.content[this.props.lang].length > 0 &&
        el.content[this.props.lang][0].content
      ) {
        return true;
      }
      /* eslint-disable no-console */
      console.error(
        `Message ${el.id} has no translation for ${this.props.lang}`,
      );
      /* eslint-enable no-console */
      return false;
    });

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
    if (!this.state.ready) {
      return null;
    }
    const messages = this.validMessages();
    if (messages.length > 0) {
      const index = Math.min(this.state.slideIndex, messages.length - 1);
      const msg = messages[index];
      const type = msg.type || 'info';
      const icon = msg.icon || 'info';
      const iconName = `icon-icon_${icon}`;

      return (
        <section
          id="messageBar"
          role="banner"
          className="message-bar flex-horizontal"
        >
          <div className="banner-container">
            <Icon img={iconName} className="message-icon" />
            <div className={`flex-grow message-bar-${type}`}>
              <SwipeableViews
                index={index}
                onChangeIndex={this.handleChange}
                className={!this.state.maximized ? 'message-bar-fade' : ''}
                containerStyle={{
                  maxHeight: this.state.maximized ? '400px' : '100px',
                  transition: 'max-height 300ms',
                }}
                slideStyle={{
                  maxHeight: this.state.maximized ? '400px' : '100px',
                  transition: 'max-height 300ms',
                  padding: '10px 10px 0px 10px',
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                {this.getTabContent()}
              </SwipeableViews>
              <Tabs
                onChange={this.handleChange}
                value={index}
                tabItemContainerStyle={{
                  backgroundColor: '#fff',
                  height: '18px',
                  width: '60px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                inkBarStyle={{ display: 'none' }}
              >
                {this.getTabs()}
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
              >
                <Icon img="icon-icon_close" className="close" />
              </button>
            </div>
          </div>
        </section>
      );
    }
    return null;
  }
}

export default connectToStores(
  MessageBar,
  ['MessageStore', 'PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
    messages: context.getStore('MessageStore').getMessages(),
  }),
);
