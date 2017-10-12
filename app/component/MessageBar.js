import PropTypes from 'prop-types';
import React, { Component } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import SwipeableViews from 'react-swipeable-views';
import { Tabs, Tab } from 'material-ui/Tabs';
import { intlShape } from 'react-intl';
import { markMessageAsRead } from '../action/MessageActions';

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
    visible: true,
  };

  getTabContent = () =>
    this.validMessages().map(el => (
      <MessageBarMessage
        key={el.id}
        id={el.id}
        onMaximize={this.maximize}
        content={el.content[this.props.lang]}
      />
    ));

  getTabs = () =>
    this.validMessages().map((el, i) => (
      <Tab
        key={el.id}
        selected={i === this.state.slideIndex}
        icon={
          // TODO: This is a hack to get around the hard-coded height in material-ui Tab component
          <span>
            <span
              style={{
                color: i === this.state.slideIndex ? '#007ac9' : '#ddd',
                fontSize: '18px',
                height: '18px',
                position: 'absolute',
                top: 0,
              }}
              title={`${this.context.intl.formatMessage({
                id: 'messagebar-label-page',
                defaultMessage: 'Page',
              })} ${i + 1}`}
            >
              •
            </span>
          </span>
        }
        value={i}
        style={{
          height: '18px',
          color: i === this.state.slideIndex ? '#007ac9' : '#ddd',
          fontSize: '18px',
          padding: '0px',
        }}
      />
    ));

  maximize = () => {
    this.setState({
      ...this.state,
      maximized: true,
    });
  };

  validMessages = () =>
    this.props.messages.filter(el => {
      if (el.content[this.props.lang] != null) {
        return true;
      }
      /* eslint-disable no-console */
      console.error(
        `Message ${el.id} hs no translation for ${this.props.lang}`,
      );
      /* eslint-enable no-console */
      return false;
    });

  /* Find the id of nth unread (we don't show read messages) and mark it as read */
  markRead = value => {
    this.context.executeAction(
      markMessageAsRead,
      this.validMessages()[value].id,
    );
  };

  handleChange = value => {
    this.markRead(value);
    this.setState({
      ...this.state,
      slideIndex: value,
    });
  };

  handleClose = () => {
    this.markRead(this.state.slideIndex);
    this.setState({
      ...this.state,
      visible: false,
    });
  };

  render = () => {
    if (this.state.visible && this.validMessages().length > 0) {
      const msg = this.validMessages()[this.state.slideIndex];
      const type = msg.type || 'info';
      const icon = msg.icon || 'info';
      const iconName = `icon-icon_${icon}`;

      return (
        <section role="banner" className="message-bar flex-horizontal">
          <Icon img={iconName} className="message-icon" />
          <div className={`flex-grow message-bar-${type}`}>
            <SwipeableViews
              index={this.state.slideIndex}
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
              value={this.state.slideIndex}
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
        </section>
      );
    }
    return null;
  };
}

export default connectToStores(
  MessageBar,
  ['MessageStore', 'PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
    messages: Array.from(context.getStore('MessageStore').messages.values())
      .filter(el => !el.read)
      .sort((el1, el2) => {
        const p1 = el1.priority || 0;
        const p2 = el2.priority || 0;
        if (p1 > p2) {
          return -1;
        }
        if (p1 < p2) {
          return 1;
        }
        return 0;
      }),
  }),
);
