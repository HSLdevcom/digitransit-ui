import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import Toggle from 'material-ui/Toggle';

import { replaceQueryParams } from '../../util/queryUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const TransferOptionsSection = (
  { defaultSettings, currentSettings, walkBoardCostHigh },
  { router, match },
) => (
  <React.Fragment>
    <Toggle
      toggled={currentSettings.walkBoardCost !== defaultSettings.walkBoardCost}
      onToggle={(event, isInputChecked) => {
        replaceQueryParams(router, match, {
          walkBoardCost: isInputChecked
            ? walkBoardCostHigh
            : defaultSettings.walkBoardCost,
        });
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'changeNumberOfTransfers', // Prolly need to change action name?
          name: isInputChecked,
        });
      }}
      title="transfers"
      name="Avoid Transfers"
      label="Avoid Transfers"
      labelStyle={{ color: '#707070' }}
    />
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
