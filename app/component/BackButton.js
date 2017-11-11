import React from 'react';
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

  goBack = () => {
    if (hasHistoryEntries()) {
      this.context.router.goBack();
    } else {
      this.context.router.push('/');
    }
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
          <Icon img="icon-icon_arrow-left" className="cursor-pointer back" />
        }
        aria-label={this.context.intl.formatMessage({
          id: 'back-button-title',
          defaultMessage: 'Go back to previous page',
        })}
      />
    );
  }
}
