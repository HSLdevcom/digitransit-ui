import React from 'react';
import PropTypes from 'prop-types';
import { routerShape } from 'react-router';
import FlatButton from 'material-ui/FlatButton';
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

  // TODO
  // Transition back in next event loop
  // Without this mobile chrome might call back twice.
  // See: https://github.com/zilverline/react-tap-event-plugin/issues/14
  // This should be removed either when we change how pages are rendered or
  // When react-tap-plugin works better
  goBack = () => {
    setTimeout(() => {
      if (hasHistoryEntries()) {
        this.context.router.goBack();
      } else {
        this.context.router.push('/');
      }
    }, 0);
  };

  render() {
    return (
      <FlatButton
        className="back-button"
        onClick={this.goBack}
        style={{
          minWidth: '40px',
          height: '40px',
          alignSelf: 'stretch',
        }}
        icon={
          <Icon
            img={this.props.icon}
            color={this.props.color}
            className={`${this.props.className} cursor-pointer`}
          />
        }
        aria-label={this.context.intl.formatMessage({
          id: 'back-button-title',
          defaultMessage: 'Go back to previous page',
        })}
      />
    );
  }
}
