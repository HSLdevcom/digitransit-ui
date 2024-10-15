import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { legShape } from '../../util/shapes';
import { legDestination } from '../../util/legUtils';
import NaviDestination from './NaviDestination';
import RouteNumber from '../RouteNumber';

export default function NaviLegContent(
  { leg, nextLeg, moveInstructions, legType },
  { intl },
) {
  if (legType === 'move') {
    return (
      <>
        <div className="destination-header">
          <FormattedMessage id={moveInstructions} defaultMessage="Go to" />
          &nbsp;
          {legDestination(intl, leg, null, nextLeg)}
        </div>
        <NaviDestination leg={leg} />
      </>
    );
  }

  if (legType === 'wait') {
    const { mode, headsign, route } = nextLeg;

    const color = route.color ? route.color : 'currentColor';
    const localizedMode = intl.formatMessage({
      id: `${mode.toLowerCase()}`,
      defaultMessage: `${mode}`,
    });
    return (
      <>
        <div className="destination-header">
          <FormattedMessage
            id="navigation-wait-mode"
            values={{ mode: localizedMode }}
            defaultMessage="Wait for"
          />
        </div>
        <div className="wait-leg">
          <RouteNumber
            mode={mode.toLowerCase()}
            text={route?.shortName}
            withBar
            isTransitLeg
            color={color}
          />
          <div className="headsign">{headsign}</div>
        </div>
      </>
    );
  }
  return null;
}

NaviLegContent.propTypes = {
  leg: legShape.isRequired,
  nextLeg: legShape.isRequired,
  moveInstructions: PropTypes.string.isRequired,
  legType: PropTypes.string,
};

NaviLegContent.defaultProps = {
  legType: 'move',
};
NaviLegContent.contextTypes = {
  intl: intlShape.isRequired,
};
