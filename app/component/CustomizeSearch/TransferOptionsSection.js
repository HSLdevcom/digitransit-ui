import React from 'react';
import { routerShape } from 'react-router';

import SelectOptionContainer, {
  getFiveStepOptions,
  getLinearStepOptions,
  valueShape,
} from './SelectOptionContainer';
import { defaultSettings } from '../../util/planParamUtil';
import { replaceQueryParams } from '../../util/queryUtils';

const TransferOptionsSection = (
  { walkBoardCost, minTransferTime },
  { router },
) => (
  <React.Fragment>
    <SelectOptionContainer
      currentSelection={walkBoardCost}
      defaultValue={defaultSettings.walkBoardCost}
      highlightDefaultValue={false}
      onOptionSelected={value =>
        replaceQueryParams(router, { walkBoardCost: value })
      }
      options={getFiveStepOptions(defaultSettings.walkBoardCost, true)}
      title="transfers"
    />
    <SelectOptionContainer
      currentSelection={minTransferTime}
      defaultValue={defaultSettings.minTransferTime}
      displayPattern="number-of-minutes"
      displayValueFormatter={seconds => seconds / 60}
      onOptionSelected={value =>
        replaceQueryParams(router, { minTransferTime: value })
      }
      options={getLinearStepOptions(
        defaultSettings.minTransferTime,
        60,
        60,
        12,
      )}
      sortByValue
      title="transfers-margin"
    />
  </React.Fragment>
);

TransferOptionsSection.propTypes = {
  walkBoardCost: valueShape.isRequired,
  minTransferTime: valueShape.isRequired,
};

TransferOptionsSection.contextTypes = {
  router: routerShape.isRequired,
};

export default TransferOptionsSection;
