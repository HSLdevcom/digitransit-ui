import PropTypes from 'prop-types';
import { graphql, useFragment } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { fragmentRefShape } from '../../utils/client/shapes';
import Icon from './Icon';
import { useConfigContext } from '../hooks/ConfigContext';

export default function DisruptionInfoButton({
  openDisruptionInfo = () => {},
  viewer: viewerRef,
}) {
  const { disruption } = useConfigContext();
  const viewer = useFragment(
    graphql`
      fragment DisruptionInfoButton_viewer on QueryType
      @argumentDefinitions(feedIds: { type: "[String!]", defaultValue: [] }) {
        alerts(feeds: $feedIds) {
          id
        }
      }
    `,
    viewerRef,
  );
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
  viewer: fragmentRefShape,
};
