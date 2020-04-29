import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import Toggle from '../Toggle';

import { replaceQueryParams } from '../../util/queryUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const TransferOptionsSection = (
  { defaultSettings, currentSettings, walkBoardCostHigh },
  { router, match },
) => (
  <React.Fragment>
    <div
      className="mode-option-container toggle-container"
      style={{
        padding: '0 0 0 1em',
        height: '3.5em',
      }}
    >
      <FormattedMessage
        id="avoid-transfers-label"
        defaultMessage="Avoid transfers"
      />
      <Toggle
        toggled={
          currentSettings.walkBoardCost !== defaultSettings.walkBoardCost
        }
        onToggle={e => {
          replaceQueryParams(router, match, {
            walkBoardCost: e.target.checked
              ? walkBoardCostHigh
              : defaultSettings.walkBoardCost,
          });
          addAnalyticsEvent({
            category: 'ItinerarySettings',
            action: 'changeNumberOfTransfers',
            name: e.target.checked,
          });
        }}
        title="transfers"
      />
    </div>
  </React.Fragment>
);

TransferOptionsSection.propTypes = {
  defaultSettings: PropTypes.shape({
    walkBoardCost: PropTypes.number.isRequired,
  }).isRequired,
  currentSettings: PropTypes.object.isRequired,
  walkBoardCostHigh: PropTypes.number.isRequired,
};

TransferOptionsSection.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default TransferOptionsSection;
