import React, { Component, PropTypes } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import SwipeableViews from 'react-swipeable-views';
import { Tabs, Tab } from 'material-ui/Tabs';
import { intlShape } from 'react-intl';

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

  getTabContent = () => (
    this.unreadMessages().map(el => (
      <MessageBarMessage
        key={el.id}
        onMaximize={this.maximize}
        content={el.content[this.props.lang]}
      />
    ))
  )

  getTabs = () => (

    this.unreadMessages().map((el, i) => (
      <Tab
        key={el.id}
        selected={i === this.state.slideIndex}
        icon={(
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
            >•</span>
          </span>
        )}
        value={i}
        style={{
          height: '18px',
          color: i === this.state.slideIndex ? '#007ac9' : '#ddd',
          fontSize: '18px',
          padding: '0px',
        }}
      />
    ))
  );

  maximize = () => {
    this.setState({
      ...this.state,
      maximized: true,
    });
  };

  unreadMessages = () => this.props.messages.filter((el) => {
    if (el.read === true) {
      return false;
    }
    if (el.content[this.props.lang] != null) {
      return true;
    }
    /* eslint-disable no-console */
    console.error(`Message ${el.id} doesn't have translation for ${this.props.lang}`);
    /* eslint-enable no-console */
    return false;
  });

  /* Find the id of nth unread (we don't show read messages) and mark it as read */
  markRead = (value) => {
    this.context.getStore('MessageStore').markMessageAsRead(this.unreadMessages()[value].id);
  };

  handleChange = (value) => {
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
    if (this.state.visible && this.unreadMessages().length > 0) {
      return (
        <section role="banner" className="message-bar flex-horizontal">
          <Icon img={'icon-icon_info'} className="info" />
          <div className="flex-grow">
            <SwipeableViews
              index={this.state.slideIndex}
              onChangeIndex={this.handleChange}
              className={!this.state.maximized ? 'message-bar-fade' : ''}
              containerStyle={{
                maxHeight: this.state.maximized ? '400px' : '60px',
                transition: 'max-height 300ms',
              }}
              slideStyle={{
                maxHeight: this.state.maximized ? '400px' : '60px',
                transition: 'max-height 300ms',
                padding: '10px',
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
              id="close-message-bar" title={this.context.intl.formatMessage({
                id: 'messagebar-label-close-message-bar',
                defaultMessage: 'Close banner',
              })}
              onClick={this.handleClose} className="noborder close-button cursor-pointer"
            >
              <Icon img="icon-icon_close" className="close" />
            </button>
          </div>
        </section>);
    }
    return null;
  }
}

export default connectToStores(
  MessageBar,
  ['MessageStore', 'PreferencesStore'],
  context => (
    { lang: context.getStore('PreferencesStore').getLanguage(),
      messages: Array.from(context.getStore('MessageStore').messages.values()) }),
);
