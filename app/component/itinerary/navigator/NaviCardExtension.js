import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../../Icon';
import StopCode from '../../StopCode';
import PlatformNumber from '../../PlatformNumber';
import {
  getZoneLabel,
  getHeadsignFromRouteLongName,
  legTime,
  legTimeStr,
} from '../../../util/legUtils';
import ZoneIcon from '../../ZoneIcon';
import { legShape, configShape } from '../../../util/shapes';
import { getDestinationProperties, LEGTYPE, withRealTime } from './NaviUtils';
import { getRouteMode, modeUsesTrack } from '../../../util/modeUtils';
import RouteNumberContainer from '../../RouteNumberContainer';
import BoardingInfo from './BoardingInfo';
import { getModeIconColor } from '../../../util/colorUtils';
import Duration from '../Duration';
import NaviIndoorButtonContainer from './indoor/NaviIndoorButtonContainer';
import NaviIndoorCard from './indoor/NaviIndoorCard';

const NaviCardExtension = (
  {
    focusToPoint,
    legType,
    previousLeg,
    leg,
    nextLeg,
    time,
    platformUpdated,
    showIndoorRoute,
    toggleShowIndoorRoute,
  },
  { config },
) => {
  const { stop, name, rentalVehicle, vehicleParking, vehicleRentalStation } =
    leg ? leg.to : nextLeg.from;
  const { code, platformCode, zoneId, vehicleMode } = stop || {};
  const [place, address] = name?.split(/, (.+)/) || [];

  let destination = {};
  if (stop) {
    destination = getDestinationProperties(
      rentalVehicle,
      vehicleParking,
      vehicleRentalStation,
      stop,
      config,
    );
  } else {
    destination.iconId = 'icon_mapMarker';
    destination.className = 'place';
    destination.name = place;
  }

  if (legType === LEGTYPE.TRANSIT) {
    const { intermediatePlaces, headsign, trip, route } = leg;
    const hs = headsign || trip.tripHeadsign;
    const stopCount = <span className="bold">{intermediatePlaces.length}</span>;
    const translationId =
      intermediatePlaces.length === 1
        ? 'navileg-one-intermediate-stop'
        : 'navileg-intermediate-stops';
    const mode = getRouteMode(route, config);
    const iconColor = getModeIconColor(config, mode) || leg.route.color;
    return (
      <div className="extension">
        <div className="extension-routenumber">
          <RouteNumberContainer
            className={cx('line', mode)}
            route={route}
            mode={mode}
            isTransitLeg
            vertical
            withBar
          />
          <div className="headsign">{hs}</div>
        </div>
        <div className="extension-divider" />
        <div className="stop-count">
          <Icon img="navi-intermediatestops" color={iconColor} omitViewBox />
          <FormattedMessage
            id={translationId}
            values={{ stopCount }}
            defaultMessage="{nrStopsRemaining} stops remaining"
          />
        </div>
      </div>
    );
  }
  const stopInformation = (expandIcon = false, showIndoorButton = false) => {
    return (
      <div className="extension-walk">
        <div className="destination-container">
          {expandIcon && <Icon img="navi-expand" className="icon-expand" />}
          <Icon
            img={destination.iconId}
            height={2}
            width={2}
            className={`destination-icon ${destination.className}`}
            color={destination.iconColor}
          />
          <div className="destination">
            {destination.name}
            <div className="details">
              {!stop && address && <div className="address">{address}</div>}
              {code && <StopCode code={code} />}
              {platformCode && (
                <PlatformNumber
                  number={platformCode}
                  short
                  isRailOrSubway={modeUsesTrack(vehicleMode)}
                  updated={platformUpdated}
                />
              )}
              <ZoneIcon
                zoneId={getZoneLabel(zoneId, config)}
                showUnknown={false}
              />
            </div>
          </div>
        </div>
        {showIndoorButton && (
          <NaviIndoorButtonContainer
            showIndoorRoute={showIndoorRoute}
            toggleShowIndoorRoute={toggleShowIndoorRoute}
            previousLeg={previousLeg}
            leg={leg}
            nextLeg={nextLeg}
            focusToPoint={focusToPoint}
          />
        )}
      </div>
    );
  };

  if (legType === LEGTYPE.WAIT_IN_VEHICLE) {
    const { route, trip } = nextLeg;
    return (
      <div className="extension">
        <div className="extension-divider" />
        <div className="wait-in-vehicle">
          <FormattedMessage
            id="navigation-interline-wait"
            values={{
              line: <span className="bold">{route.shortName}</span>,
              destination: (
                <span className="bold">
                  {trip.tripHeadsign || getHeadsignFromRouteLongName(route)}
                </span>
              ),
            }}
          />
        </div>
        {stopInformation(true)}
      </div>
    );
  }
  if (legType === LEGTYPE.MOVE && nextLeg?.transitLeg) {
    if (showIndoorRoute) {
      return (
        <NaviIndoorCard
          toggleShowIndoorRoute={toggleShowIndoorRoute}
          previousLeg={previousLeg}
          leg={leg}
          nextLeg={nextLeg}
          focusToPoint={focusToPoint}
        />
      );
    }
    const { headsign, route, start } = nextLeg;
    const hs = headsign || nextLeg.trip?.tripHeadsign;
    const remainingDuration = <Duration duration={legTime(start) - time} />;
    const rt = nextLeg.realtimeState === 'UPDATED';
    const values = {
      duration: withRealTime(rt, remainingDuration),
      legTime: withRealTime(rt, legTimeStr(start)),
    };
    const routeMode = getRouteMode(route, config);
    return (
      <div className={cx('extension', 'no-vertical-margin')}>
        <div className="extension-divider" />
        {stopInformation(false, true)}
        <div className="extension-divider" />
        <BoardingInfo
          route={route}
          mode={routeMode}
          headsign={hs}
          translationValues={values}
          withExpandIcon
        />
      </div>
    );
  }

  return (
    <div className="extension">
      <div className="extension-divider" />
      {stopInformation(true)}
    </div>
  );
};
NaviCardExtension.propTypes = {
  focusToPoint: PropTypes.func.isRequired,
  previousLeg: legShape,
  leg: legShape,
  nextLeg: legShape,
  legType: PropTypes.string,
  time: PropTypes.number.isRequired,
  platformUpdated: PropTypes.bool,
  showIndoorRoute: PropTypes.bool,
  toggleShowIndoorRoute: PropTypes.func.isRequired,
};

NaviCardExtension.defaultProps = {
  legType: '',
  previousLeg: undefined,
  leg: undefined,
  nextLeg: undefined,
  platformUpdated: false,
  showIndoorRoute: false,
};

NaviCardExtension.contextTypes = {
  config: configShape.isRequired,
};

export default NaviCardExtension;
