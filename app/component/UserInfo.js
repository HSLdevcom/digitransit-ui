import PropTypes from 'prop-types';
import withOutsideClick from 'react-click-outside';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import Icon from './Icon';

class UserInfo extends Component {
  static propTypes = {
    list: PropTypes.array,
    isMobile: PropTypes.bool,
    user: PropTypes.object,
  };

  static defaultProps = {
    isMobile: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      listOpen: false,
    };
  }

  handleClickOutside() {
    this.setState({
      listOpen: false,
    });
  }

  toggleList() {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen,
    }));
  }

  render() {
    const { list, isMobile, user } = this.props;
    const { listOpen } = this.state;
    const rightBorder = !listOpen ? 'right-border' : '';

    return (
      <div className={`userinfo-wrapper ${rightBorder}`}>
        <button className="noborder" onClick={() => this.toggleList()}>
          <div className="userinfo-header">
            <div className="userinfo-title">
              <Icon
                img="icon-icon_user"
                width={1.25}
                height={1.25}
                color="#fff"
              />
              <div
                className={cx(
                  'userinfo-title-text',
                  isMobile ? 'mobile' : 'desktop',
                )}
              >
                {user.name}
              </div>
              <div className={listOpen ? 'rotate-icon' : ''}>
                <Icon img="icon-icon_arrow-dropdown" color="#fff" />
              </div>
            </div>
          </div>
        </button>
        {listOpen && (
          <div className={cx('userinfo-list', isMobile ? 'mobile' : '')}>
            {/* eslint-disable jsx-a11y/click-events-have-key-events */}
            {list.map(item => (
              <button className="noborder" key={item.key}>
                <a href={item.href}>
                  <div
                    className={cx(
                      'userinfo-list-item',
                      isMobile ? 'mobile' : 'desktop',
                    )}
                  >
                    <FormattedMessage
                      id={item.messageId}
                      defaultMessage={item.messageId}
                    />
                  </div>
                </a>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
}

const enhancedComponent = withOutsideClick(UserInfo);

export { enhancedComponent as default, UserInfo as Component };
