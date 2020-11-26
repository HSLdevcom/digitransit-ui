import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import ZoneIcon from './ZoneIcon';
import { PREFIX_STOPS } from '../util/path';
import Icon from './Icon';

function IntermediateLeg({
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
  zoneLabelColor,
  isCanceled,
  isLastPlace,
}) {
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
        {showZoneLimits && currentZoneId && (
          <div className="zone-icons-container">
            {previousZoneId && (
              <ZoneIcon
                zoneId={previousZoneId}
                zoneLabelColor={zoneLabelColor}
                zoneLabelHeight="20px"
                zoneLabelWidth="20px"
                zoneLabelLineHeight="20px"
                zoneIdFontSize="16px"
              />
            )}
            <ZoneIcon
              zoneId={currentZoneId}
              className={cx({
                'zone-delimiter':
                  showCurrentZoneDelimiter || (previousZoneId && currentZoneId),
              })}
              zoneLabelColor={zoneLabelColor}
              zoneLabelHeight="20px"
              zoneLabelWidth="20px"
              zoneLabelLineHeight="20px"
              zoneIdFontSize="16px"
            />
            {nextZoneId && (
              <ZoneIcon
                zoneId={nextZoneId}
                zoneLabelColor={zoneLabelColor}
                zoneLabelHeight="20px"
                zoneLabelWidth="20px"
                zoneLabelLineHeight="20px"
                zoneIdFontSize="16px"
                className="zone-delimiter"
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
                {realTime && (
                  <Icon
                    img="icon-icon_realtime"
                    className="realtime-icon realtime"
                  />
                )}
                <span className={cx({ canceled: isCanceled })}>
                  {moment(arrivalTime).format('HH:mm')}
                </span>
              </span>
              {` ${name}`}
            </div>
            <Icon
              img="icon-icon_arrow-collapse--right"
              className="itinerary-arrow-icon"
              color="#333"
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
  zoneLabelColor: PropTypes.string,
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

export default IntermediateLeg;
