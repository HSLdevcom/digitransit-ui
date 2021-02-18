import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { PREFIX_STOPS, PREFIX_TERMINALS } from '../util/path';
import StopNearYouHeader from './StopNearYouHeader';
import StopNearYouDepartureRowContainer from './StopNearYouDepartureRowContainer';

const StopNearYou = ({ stop, stopIsStation, ...props }) => {
  const stopOrStation = stop.parentStation ? stop.parentStation : stop;
  const desc = stopOrStation.desc ? stopOrStation.desc : stop.desc;
  const isStation = !!stop.parentStation || stopIsStation;
  const linkAddress = stop.parentStation
    ? `/${PREFIX_TERMINALS}/${stop.parentStation.gtfsId}`
    : `/${PREFIX_STOPS}/${stop.gtfsId}`;
  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <StopNearYouHeader
          stop={stopOrStation}
          desc={desc}
          isStation={isStation}
          linkAddress={linkAddress}
        />
        <StopNearYouDepartureRowContainer
          stopTimes={stopOrStation.stoptimesWithoutPatterns}
          currentTime={props.currentTime}
          isStation={isStation && stop.vehicleMode !== 'SUBWAY'}
        />
        <Link
          className="stop-near-you-more-departures"
          as="button"
          onClick={e => {
            e.stopPropagation();
          }}
          to={linkAddress}
        >
          <FormattedMessage
            id="more-departures"
            defaultMessage="More departures"
          />
        </Link>
      </div>
    </span>
  );
};

StopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
  stopIsStation: PropTypes.bool.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default StopNearYou;
