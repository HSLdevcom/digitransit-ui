import React from 'react';
import PropTypes from 'prop-types';
import { routerShape } from 'react-router';
import { intlShape } from 'react-intl';
import Icon from './Icon';
import { isBrowser, isIOSApp } from '../util/browser';
import { getIndex } from '../localStorageHistory';

const hasHistoryEntries = () =>
  (isIOSApp && getIndex() > 0) || (isBrowser && window.history.length);

export default class BackButton extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape,
  };

  static propTypes = {
    icon: PropTypes.string,
    className: PropTypes.string,
    color: PropTypes.string,
  };

  static defaultProps = {
    icon: 'icon-icon_arrow-left',
    className: 'back',
    color: 'white',
  };

  goBack = () => {
    if (hasHistoryEntries()) {
      this.context.router.goBack();
    } else {
      this.context.router.push('/');
    }
  };

  render() {
    return (
      <button
        className="icon-holder noborder cursor-pointer"
        style={{ paddingTop: '7px' }}
        onClick={this.goBack}
        aria-label={this.context.intl.formatMessage({
          id: 'back-button-title',
          defaultMessage: 'Go back to previous page',
        })}
      >
        <Icon
          img={this.props.icon}
          color={this.props.color}
          className={`${this.props.className} cursor-pointer`}
        />
      </button>
    );
  }
}
