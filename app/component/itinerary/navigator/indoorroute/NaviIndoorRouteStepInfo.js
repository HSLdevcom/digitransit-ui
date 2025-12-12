import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../../../../util/shapes';
import Icon from '../../../Icon';
import {
  getIndoorRouteTranslationId,
  getVerticalTransportationUseIconId,
} from '../../../../util/indoorUtils';
import { IndoorRouteStepType, VerticalDirection } from '../../../../constants';
import ItineraryMapAction from '../../ItineraryMapAction';
import { isKeyboardSelectionEvent } from '../../../../util/browser';

function NaviIndoorRouteStepInfo({
  focusAction,
  type,
  verticalDirection,
  toLevelName,
}) {
  const indoorTranslationId = getIndoorRouteTranslationId(
    type,
    verticalDirection,
    toLevelName,
  );

  return (
    <div
      className="navi-indoor-route-step-info"
      role="button"
      tabIndex="0"
      onClick={focusAction}
      onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
    >
      <Icon
        img={getVerticalTransportationUseIconId(verticalDirection, type, false)}
        className="navi-indoor-route-step-icon"
      />
      <div className="navi-indoor-route-step-text">
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

NaviIndoorRouteStepInfo.propTypes = {
  focusAction: PropTypes.func.isRequired,
  type: PropTypes.oneOf(Object.values(IndoorRouteStepType)).isRequired,
  verticalDirection: PropTypes.oneOf(Object.values(VerticalDirection)),
  toLevelName: PropTypes.string,
};

NaviIndoorRouteStepInfo.defaultProps = {
  verticalDirection: undefined,
  toLevelName: undefined,
};

NaviIndoorRouteStepInfo.contextTypes = {
  config: configShape.isRequired,
};

export default NaviIndoorRouteStepInfo;
