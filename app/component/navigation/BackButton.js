import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Icon from '../icon/Icon';

export default class BackButton extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object,
  };

  // TODO
  // Transition back in next event loop
  // Without this mobile chrome might call back twice.
  // See: https://github.com/zilverline/react-tap-event-plugin/issues/14
  // This should be removed either when we change how pages are rendered or
  // When react-tap-plugin works better
  goBack = () => {
    setTimeout(() => {
      if (window.history.length > 1) {
        this.context.router.goBack();
      } else {
        this.context.router.push('/');
      }
    }, 0);
  }

  render() {
    return (
      <FlatButton
        onClick={this.goBack}
        style={{
          minWidth: '40px',
          height: '40px',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        icon={<Icon img="icon-icon_arrow-left" className="cursor-pointer back" />}
      />
    );
  }
}
