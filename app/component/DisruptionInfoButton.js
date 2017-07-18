import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

function DisruptionInfoButton(props, { config }) {
  if (!config.disruption || config.disruption.showInfoButton) {
    return (
      <div
        className={'cursor-pointer disruption-info'}
        onClick={props.toggleDisruptionInfo}
      >
        <FormattedMessage id="disruptions" defaultMessage="Disruptions" />
        {props.root &&
          props.root.alerts &&
          props.root.alerts.length > 0 &&
          <Icon img={'icon-icon_caution'} className={'disruption-info'} />}
      </div>
    );
  }
  return null;
}

DisruptionInfoButton.propTypes = {
  toggleDisruptionInfo: PropTypes.func.isRequired,
  root: PropTypes.shape({
    alerts: PropTypes.array,
  }).isRequired,
};

DisruptionInfoButton.contextTypes = {
  config: PropTypes.object.isRequired,
};

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
