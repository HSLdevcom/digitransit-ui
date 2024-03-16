import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { ConfigShape } from '../util/shapes';
import Icon from './Icon';

function DisruptionInfoButton(props, { config }) {
  if (!config.disruption || config.disruption.showInfoButton) {
    return (
      <button
        type="button"
        className="cursor-pointer disruption-info noborder"
        onClick={props.openDisruptionInfo}
      >
        <FormattedMessage
          id="disruptions-and-diversions"
          defaultMessage="Disruptions and diversions"
        />
        {props.viewer?.alerts?.length > 0 && (
          <Icon
            img="icon-icon_caution_white_exclamation"
            className="disruption-info"
          />
        )}
      </button>
    );
  }
  return null;
}

DisruptionInfoButton.propTypes = {
  openDisruptionInfo: PropTypes.func.isRequired,
  viewer: PropTypes.shape({
    alerts: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
  }),
};

DisruptionInfoButton.defaultProps = {
  viewer: {
    alerts: [],
  },
};

DisruptionInfoButton.contextTypes = {
  config: ConfigShape.isRequired,
};

export default createFragmentContainer(DisruptionInfoButton, {
  viewer: graphql`
    fragment DisruptionInfoButton_viewer on QueryType
    @argumentDefinitions(feedIds: { type: "[String!]", defaultValue: [] }) {
      alerts(feeds: $feedIds) {
        id
      }
    }
  `,
});
