import PropTypes from 'prop-types';
import React from 'react';
import { useFragment } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { matchShape } from 'found';
import { configShape, planEdgeShape } from '../../util/shapes';
import Icon from '../Icon';
import Itinerary from './Itinerary';
import {
  getExtendedMode,
  showBikeBoardingNote,
  showCarBoardingNote,
} from '../../util/legUtils';
import ItineraryListHeader from './ItineraryListHeader';
import ItinerariesNotFound from './ItinerariesNotFound';
import Loading from '../Loading';
import { streetHash } from '../../util/path';
import { getIntermediatePlaces } from '../../util/otpStrings';
import { ItineraryListPlanEdges } from './queries/ItineraryListPlanEdges';

const spinnerPosition = {
  top: 'top',
  bottom: 'bottom',
};

function ItineraryList(
  {
    planEdges: planEdgesRef,
    activeIndex,
    onSelect,
    onSelectImmediately,
    searchTime,
    bikeParkItineraryCount,
    carDirectItineraryCount,
    showRelaxedPlanNotifier,
    rentalVehicleNotifierId,
    separator2,
    loadingMore,
    separator1,
    ...rest
  },
  context,
) {
  const { config } = context;
  const { location } = context.match;
  const { hash } = context.match.params;

  const planEdges = useFragment(ItineraryListPlanEdges, planEdgesRef);

  const co2s = planEdges
    .filter(e => e.node.emissionsPerPerson?.co2 >= 0)
    .map(e => e.node.emissionsPerPerson.co2);
  const lowestCo2value = Math.round(Math.min(...co2s));

  const summaries = planEdges.map((edge, i) => (
    <Itinerary
      refTime={searchTime}
      key={i} // eslint-disable-line react/no-array-index-key
      hash={i}
      itinerary={edge.node}
      passive={i !== activeIndex}
      onSelect={onSelect}
      onSelectImmediately={onSelectImmediately}
      intermediatePlaces={getIntermediatePlaces(location.query)}
      hideSelectionIndicator={i !== activeIndex || planEdges.length === 1}
      lowestCo2value={lowestCo2value}
    />
  ));

  if (hash === streetHash.parkAndRide) {
    summaries.splice(
      0,
      0,
      <ItineraryListHeader
        translationId="leave-your-car-park-and-ride"
        defaultMessage="Park & Ride"
        key="itinerary-summary.parkride-title"
      />,
    );
  }
  if (hash === streetHash.bikeAndVehicle) {
    // bikeParkItineraryCount tells how many itineraries in array start use bike parking
    if (bikeParkItineraryCount > 0 || !planEdges.length) {
      summaries.splice(
        0,
        0,
        <ItineraryListHeader
          translationId="itinerary-summary.bikePark-title"
          key="itinerary-summary.bikepark-title"
        />,
      );
    }
    if (planEdges.length > bikeParkItineraryCount) {
      // the rest use bike + public
      const mode =
        getExtendedMode(
          planEdges[bikeParkItineraryCount].node.legs.find(l => l.transitLeg),
          config,
        ) || 'rail';
      const legs = planEdges
        .slice(bikeParkItineraryCount)
        .flatMap(edge => edge.node.legs);
      const showBikeBoardingInfo = legs.some(leg =>
        showBikeBoardingNote(leg, config),
      );

      summaries.splice(
        bikeParkItineraryCount ? bikeParkItineraryCount + 1 : 0,
        0,
        <ItineraryListHeader
          translationId={`itinerary-summary.bikeAndPublic-${mode}-title`}
          defaultMessage="Take your bike with you onboard"
          key="itinerary-summary.bikeandpublic-title"
          showBikeBoardingInfo={showBikeBoardingInfo}
        />,
      );
    }
  }
  if (hash === streetHash.carAndVehicle) {
    // carDirectItineraryCount tells how many itineraries in array use the direct mode (should be 1 or 0).
    if (planEdges.length > carDirectItineraryCount) {
      // the rest use car + public
      const mode =
        getExtendedMode(
          planEdges[carDirectItineraryCount].node.legs.find(l => l.transitLeg),
          config,
        ) || 'ferry';
      const legs = planEdges
        .slice(carDirectItineraryCount)
        .flatMap(edge => edge.node.legs);
      const showCarBoardingInfo = legs.some(leg =>
        showCarBoardingNote(leg, config),
      );

      summaries.splice(
        carDirectItineraryCount,
        0,
        <ItineraryListHeader
          translationId={`itinerary-summary.carAndPublic-${mode}-title`}
          defaultMessage="Take your car with you onboard"
          key="itinerary-summary.carandpublic-title"
          showCarBoardingInfo={showCarBoardingInfo}
        />,
      );
    }
  }
  if (separator2) {
    summaries.splice(
      separator2,
      0,
      <div
        className="summary-list-separator"
        key={`summary-list-separator-${separator2}`}
      />,
    );
  }
  if (separator1) {
    const pos = separator2 ? separator1 + 1 : separator1;
    summaries.splice(
      pos,
      0,
      <div
        className="summary-list-separator"
        key={`summary-list-separator-${pos}`}
      />,
    );
  }
  return (
    <div className="summary-list-container" role="list">
      {showRelaxedPlanNotifier && (
        <div
          className={cx(
            'flex-horizontal',
            'summary-notification',
            'show-alternatives',
          )}
        >
          <Icon className="icon_settings" img="icon_settings" />
          <div>
            <FormattedMessage
              id="no-route-showing-alternative-options"
              defaultMessage="No routes with current settings found. Here are some alternative options:"
            />
          </div>
        </div>
      )}
      {rentalVehicleNotifierId?.length && (
        <div
          className={cx(
            'flex-horizontal',
            'alternative-vehicle-info',
            'summary-notification',
          )}
        >
          <Icon className="info-icon" img="icon_info" />
          <div>
            <div className="alternative-vehicle-info-header">
              <FormattedMessage id="no-route-msg" />
            </div>
            <div className="alternative-vehicle-info-content">
              <FormattedMessage
                id={`${rentalVehicleNotifierId}-alternative`}
                values={{
                  paymentInfo: (
                    <FormattedMessage
                      id={`payment-info-${rentalVehicleNotifierId}`}
                    />
                  ),
                }}
              />
            </div>
          </div>
        </div>
      )}
      {loadingMore === spinnerPosition.top && (
        <div className="summary-list-spinner-container">
          <Loading />
        </div>
      )}
      <div
        className={cx('summary-list-items', {
          'summary-list-items-loading-top': loadingMore === spinnerPosition.top,
        })}
      >
        {summaries}
      </div>
      {loadingMore === spinnerPosition.bottom && (
        <div className="summary-list-spinner-container">
          <Loading />
        </div>
      )}
      {!planEdges.length && (
        <ItinerariesNotFound searchTime={searchTime} {...rest} />
      )}
    </div>
  );
}

ItineraryList.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  searchTime: PropTypes.number.isRequired,
  planEdges: PropTypes.arrayOf(planEdgeShape),
  onSelect: PropTypes.func.isRequired,
  onSelectImmediately: PropTypes.func.isRequired,
  bikeParkItineraryCount: PropTypes.number,
  carDirectItineraryCount: PropTypes.number,
  showRelaxedPlanNotifier: PropTypes.bool,
  rentalVehicleNotifierId: PropTypes.string,
  separator1: PropTypes.number,
  separator2: PropTypes.number,
  loadingMore: PropTypes.string,
};

ItineraryList.defaultProps = {
  bikeParkItineraryCount: 0,
  carDirectItineraryCount: 0,
  planEdges: [],
  showRelaxedPlanNotifier: false,
  rentalVehicleNotifierId: undefined,
  separator1: undefined,
  separator2: undefined,
  loadingMore: undefined,
};

ItineraryList.contextTypes = {
  config: configShape.isRequired,
  match: matchShape.isRequired,
};

export { ItineraryList as default, spinnerPosition };
