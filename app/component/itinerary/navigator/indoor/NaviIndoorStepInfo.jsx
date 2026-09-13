import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../../../../util/shapes.js';
import Icon from '../../../Icon.jsx';
import {
  getIndoorTranslationId,
  getVerticalTransportationUseIconId,
} from '../../../../util/indoorUtils.js';
import { IndoorStepType, VerticalDirection } from '../../../../constants.js';
import ItineraryMapAction from '../../ItineraryMapAction.jsx';
import { isKeyboardSelectionEvent } from '../../../../util/browser.js';

function NaviIndoorStepInfo({
  focusAction,
  type,
  verticalDirection,
  toLevelName,
}) {
  const indoorTranslationId = getIndoorTranslationId(
    type,
    verticalDirection,
    toLevelName,
  );

  return (
    <div
      className="navi-indoor-step-info"
      role="button"
      tabIndex="0"
      onClick={focusAction}
      onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
    >
      <Icon
        img={getVerticalTransportationUseIconId(verticalDirection, type, false)}
        className="navi-indoor-step-icon"
      />
      <div className="navi-indoor-step-text">
        <FormattedMessage
          id={indoorTranslationId}
          defaultMessage="Indoor step"
          values={{ toLevelName }}
        />
      </div>
      <ItineraryMapAction target="" focusAction={focusAction} />
    </div>
  );
}

NaviIndoorStepInfo.propTypes = {
  focusAction: PropTypes.func.isRequired,
  type: PropTypes.oneOf(Object.values(IndoorStepType)).isRequired,
  verticalDirection: PropTypes.oneOf(Object.values(VerticalDirection)),
  toLevelName: PropTypes.string,
};

NaviIndoorStepInfo.defaultProps = {
  verticalDirection: undefined,
  toLevelName: undefined,
};

NaviIndoorStepInfo.contextTypes = {
  config: configShape.isRequired,
};

export default NaviIndoorStepInfo;
