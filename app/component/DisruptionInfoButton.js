import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
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
  }),
};

DisruptionInfoButton.defaultProps = {
  root: {
    alerts: [],
  },
};

DisruptionInfoButton.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default createFragmentContainer(DisruptionInfoButton, {
  root: graphql`
    fragment DisruptionInfoButton_root on QueryType {
      alerts(feeds: $feedIds) {
        id
      }
    }
  `,
});
