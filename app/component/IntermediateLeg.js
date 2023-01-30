import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { localizeTime } from '../util/timeUtils';
import ZoneIcon from './ZoneIcon';
import { PREFIX_STOPS } from '../util/path';
import Icon from './Icon';

function IntermediateLeg(
  {
    color,
    mode,
    name,
    arrivalTime,
    realTime,
    focusFunction,
    gtfsId,
    showCurrentZoneDelimiter,
    showZoneLimits,
    previousZoneId,
    currentZoneId,
    nextZoneId,
    isCanceled,
    isLastPlace,
  },
  { config },
) {
  const modeClassName = mode.toLowerCase();
  const isDualZone = currentZoneId && (previousZoneId || nextZoneId);
  const isTripleZone = currentZoneId && previousZoneId && nextZoneId;

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div
      style={{ width: '100%' }}
      className={cx(
        'row itinerary-row',
        showZoneLimits && {
          'zone-dual': isDualZone && !isTripleZone,
          'zone-triple': isTripleZone,
          'zone-previous': currentZoneId && previousZoneId,
        },
      )}
      onClick={e => focusFunction(e)}
    >
      <div className="small-2 columns itinerary-time-column">
        {showZoneLimits &&
          currentZoneId &&
          gtfsId &&
          config.feedIds.includes(gtfsId.split(':')[0]) && (
            <div className="time-column-zone-icons-container intermediate-leg">
              {previousZoneId && <ZoneIcon zoneId={previousZoneId} />}
              <ZoneIcon
                zoneId={currentZoneId}
                className={cx({
                  'zone-delimiter':
                    showCurrentZoneDelimiter ||
                    (previousZoneId && currentZoneId),
                })}
                showUnknown
              />
              {nextZoneId && (
                <ZoneIcon
                  zoneId={nextZoneId}
                  className="zone-delimiter"
                  showUnknown
                />
              )}
            </div>
          )}
      </div>
      <div className={`leg-before ${modeClassName}`}>
        <div className={`leg-before-circle circle-fill ${modeClassName}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={28}
            height={28}
            style={{ fill: '#fff', stroke: color }}
          >
            <circle strokeWidth="3" width={28} cx={11} cy={10} r={4} />
          </svg>
        </div>
        <div style={{ color }} className={`leg-before-line ${modeClassName}`} />
        {isLastPlace && (
          <div className={`leg-before-circle circle ${mode.toLowerCase()}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={28}
              height={28}
              style={{ fill: '#fff' }}
            >
              <circle strokeWidth="4" width={28} cx={11} cy={10} r={6} />
            </svg>
          </div>
        )}
      </div>
      <div
        className={`small-9 columns itinerary-instruction-column intermediate ${modeClassName}`}
      >
        <Link
          onClick={e => {
            e.stopPropagation();
          }}
          to={`/${PREFIX_STOPS}/${gtfsId}`}
        >
          <div className="itinerary-leg-row-intermediate">
            <div className="itinerary-intermediate-stop-name">
              <span className={cx({ realtime: realTime })}>
                <span className={cx({ canceled: isCanceled })}>
                  {localizeTime(arrivalTime)}
                </span>
              </span>
              {` ${name}`}
            </div>
            <Icon
              img="icon-icon_arrow-collapse--right"
              className="itinerary-arrow-icon"
              color={config.colors.primary}
            />
          </div>
        </Link>
      </div>
    </div>
  );
}

IntermediateLeg.propTypes = {
  focusFunction: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  arrivalTime: PropTypes.number.isRequired,
  realTime: PropTypes.bool,
  mode: PropTypes.string.isRequired,
  color: PropTypes.string,
  showCurrentZoneDelimiter: PropTypes.bool,
  showZoneLimits: PropTypes.bool,
  previousZoneId: PropTypes.string,
  currentZoneId: PropTypes.string,
  nextZoneId: PropTypes.string,
  isLastPlace: PropTypes.bool,
  gtfsId: PropTypes.string,
  isCanceled: PropTypes.bool,
};

IntermediateLeg.defaultProps = {
  showCurrentZoneDelimiter: false,
  showZoneLimits: false,
  previousZoneId: undefined,
  currentZoneId: undefined,
  nextZoneId: undefined,
  isCanceled: false,
};

IntermediateLeg.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default IntermediateLeg;
