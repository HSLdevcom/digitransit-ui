import React, { Component, PropTypes } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import SwipeableViews from 'react-swipeable-views';
import { Tabs, Tab } from 'material-ui/Tabs';

import Icon from '../icon/icon';


/* Small version has constant height,
 * big version has max height of half but can be
 * less if the message is shorter.
 */

class MessageBar extends Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static propTypes = {
    lang: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      slideIndex: 0,
      maximized: false,
      visible: true,
    };
  }

  getTabContent = () => (
    this.unreadMessages().map((el, i) => (
      <div key={i} onClick={this.maximize}>
        <h2>{el.content[this.props.lang].title}</h2>
        {el.content[this.props.lang].content}
      </div>
    ))
  );

  getTabs = () => (
    this.unreadMessages().map((el, i) => (
      <Tab
        key={i}
        selected={i === this.state.slideIndex}
        label="•"
        value={i}
        style={{
          height: '18px',
          color: i === this.state.slideIndex ? '#007ac9' : '#ddd',
          fontSize: '34px',
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
        <div className="message-bar">
          <Icon img={'icon-icon_info'} className="info" />
          <a onClick={this.handleClose} className="close-button cursor-pointer">
            <Icon img="icon-icon_close" className="close" />
          </a>
          <SwipeableViews
            index={this.state.slideIndex}
            onChangeIndex={this.handleChange}
            containerStyle={{ height: this.state.maximized ? '50%' : '60px' }}
            slideStyle={{ padding: '10px', overflow: 'hidden', background: '#fff' }}
          >
            {this.getTabContent()}
          </SwipeableViews>
          <Tabs
            onChange={this.handleChange}
            value={this.state.slideIndex}
            tabItemContainerStyle={{
              backgroundColor: '#fff',
              lineHeight: '18px',
              width: '60px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            inkBarStyle={{ display: 'none' }}
          >
            {this.getTabs()}
          </Tabs>
        </div>);
    }
    return null;
  }
}

export default connectToStores(
  MessageBar,
  ['MessageStore', 'PreferencesStore'],
  (context) => (
    { lang: context.getStore('PreferencesStore').getLanguage(),
      messages: Array.from(context.getStore('MessageStore').messages.values()) })
);
