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
  }

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
        icon={<Icon img="icon-icon_arrow-left" className="cursor-pointer back" />}
      ><span
        title={this.context.intl.formatMessage({
          id: 'back-button-title',
          defaultMessage: 'Go back to previous page',
        })}
      /></FlatButton>
    );
  }
}
