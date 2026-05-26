import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage, useIntl } from 'react-intl';
import { legShape, legTimeShape } from '../../util/shapes';
import Icon from '../Icon';
import { durationToString } from '../../util/timeUtils';
import ItineraryMapAction from './ItineraryMapAction';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { PREFIX_STOPS } from '../../util/path';
import { legTimeStr, getValidatedLegName } from '../../util/legUtils';
import { ViaLocationType } from '../../constants';
import { useConfigContext } from '../../configurations/ConfigContext';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function WaitLeg({
  children,
  leg,
  start,
  waitTime,
  focusAction,
  index,
  icon,
  hasPreviousTransitLeg,
}) {
  const intl = useIntl();
  const modeClassName = 'wait';
  const { colors } = useConfigContext();
  const legName = getValidatedLegName(leg.to.name, intl, true);

  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="wait-amount-of-time"
          values={{
            duration: durationToString(intl, waitTime),
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">{legTimeStr(start)}</div>
      </div>
      <ItineraryCircleLineWithIcon
        modeClassName={modeClassName}
        index={index}
        icon={icon}
        isNotFirstLeg
        hasPreviousTransitLeg={hasPreviousTransitLeg}
      />
      <div className="small-9 columns itinerary-instruction-column wait">
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: legName || '' }}
          />
        </span>
        <div className="itinerary-leg-first-row wait">
          <div className="itinerary-leg-row">
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              to={`/${PREFIX_STOPS}/${leg.to.stop.gtfsId}`}
            >
              {legName}
              {leg.from.viaLocationType === ViaLocationType.PassThrough && (
                <Icon
                  img="icon_mapMarker"
                  className="itinerary-mapmarker-icon"
                />
              )}
              <Icon
                img="icon_arrow-collapse--right"
                className="itinerary-arrow-icon"
                color={colors.primary}
              />
            </Link>
            <div className="stop-code-container">{children}</div>
          </div>
          <ItineraryMapAction
            target={legName || ''}
            focusAction={focusAction}
          />
        </div>
        <div className="itinerary-leg-action itinerary-leg-action-content">
          <FormattedMessage
            id="wait-amount-of-time"
            values={{ duration: `(${durationToString(intl, waitTime)})` }}
            defaultMessage="Wait {duration}"
          />
          <ItineraryMapAction target="" focusAction={focusAction} />
        </div>
      </div>
    </div>
  );
}

WaitLeg.propTypes = {
  start: legTimeShape.isRequired,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node,
  waitTime: PropTypes.number.isRequired,
  leg: legShape.isRequired,
  icon: PropTypes.string,
  hasPreviousTransitLeg: PropTypes.bool,
};

WaitLeg.defaultProps = {
  children: undefined,
  icon: undefined,
  hasPreviousTransitLeg: false,
};

export default WaitLeg;
