import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { alertShape } from '../../utils/client/shapes';
import Icon from './Icon';
import { useConfigContext } from '../client/ConfigContext';

function DisruptionInfoButton({
  openDisruptionInfo = () => {},
  viewer = { alerts: [] },
}) {
  const { disruption } = useConfigContext();
  if (disruption?.showInfoButton) {
    return (
      <button
        type="button"
        className="cursor-pointer disruption-info noborder"
        onClick={openDisruptionInfo}
      >
        <FormattedMessage id="traffic-now-long" defaultMessage="Services now" />
        {viewer?.alerts?.length > 0 && (
          <Icon
            aria-hidden="true"
            img="icon_caution_white_exclamation"
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
  viewer: PropTypes.shape({ alerts: PropTypes.arrayOf(alertShape) }),
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
