import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

class DisruptionInfoButton extends React.Component {
  static propTypes = {
    toggleDisruptionInfo: PropTypes.func,
    root: PropTypes.shape({
      alerts: PropTypes.array,
    }).isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  render() {
    if (
      !this.context.config.disruption ||
      this.context.config.disruption.showInfoButton
    ) {
      return (
        <div
          className={'cursor-pointer disruption-info'}
          onClick={this.props.toggleDisruptionInfo}
        >
          <FormattedMessage id="disruptions" defaultMessage="Disruptions" />
          {this.props.root &&
            this.props.root.alerts &&
            this.props.root.alerts.length > 0 &&
            <Icon img={'icon-icon_caution'} className={'disruption-info'} />}
        </div>
      );
    }
    return null;
  }
}

export default Relay.createContainer(DisruptionInfoButton, {
  fragments: {
    root: () => Relay.QL`
      fragment on QueryType {
        alerts(feeds:$feedIds) {
          id
        }
      }
    `,
  },
  initialVariables: { feedIds: null },
});
