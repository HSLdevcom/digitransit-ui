import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import Modal from '@hsl-fi/modal';
import Icon from './Icon';
import { addressToItinerarySearch, locationToOTP } from '../util/otpStrings';
import {
  getPathWithEndpointObjects,
  getSummaryPath,
  PREFIX_ITINERARY_SUMMARY,
} from '../util/path';

const MapRoutingButton = ({ stop }, { intl, router, match, config }) => {
  const [showModal, setShowModal] = useState(false);
  const [buttonText, setButtonText] = useState(null);
  useEffect(() => {
    if (!!stop?.carParkId || !!stop?.bikeParkId) {
      setButtonText('route-to-park');
    } else if (stop?.vehicleMode === 'FERRY') {
      setButtonText('route-to-ferry');
    } else if (stop?.locationType === 'STATION') {
      setButtonText('route-to-station');
    } else {
      setButtonText('route-to-stop');
    }
  }, [stop]);
  const { location } = match;
  const closeModal = () => setShowModal(false);
  // Reset query parameters from timetablepage  that is not needed in summary page
  const locationWithoutQuery = { ...location, query: {}, search: '' };
  const onSelectLocation = (item, id) => {
    // eslint-disable-next-line no-param-reassign
    item = { ...item, address: item.name };
    if (id === 'origin') {
      const newLocation = {
        ...locationWithoutQuery,
        pathname: getPathWithEndpointObjects(
          item,
          {},
          PREFIX_ITINERARY_SUMMARY,
        ),
      };
      router.push(newLocation);
    } else if (id === 'destination') {
      const newLocation = {
        ...locationWithoutQuery,
        pathname: getPathWithEndpointObjects(
          {},
          item,
          PREFIX_ITINERARY_SUMMARY,
        ),
      };
      router.push(newLocation);
    } else {
      const newLocation = {
        ...location,
        pathname: getSummaryPath(
          addressToItinerarySearch({}),
          addressToItinerarySearch({}),
        ),
        query: {
          intermediatePlaces: locationToOTP(item),
        },
      };
      router.push(newLocation);
    }
  };

  return (
    <>
      <button
        type="button"
        className="map-routing-button"
        onClick={() => {
          setShowModal(true);
        }}
      >
        <Icon className="map-routing-button-icon" img="icon-icon_route" />
        {buttonText && (
          <FormattedMessage id={buttonText} defaultMessage="Route to stop" />
        )}
      </button>
      {showModal && (
        <Modal
          appElement="#app"
          contentLabel=""
          closeButtonLabel={intl.formatMessage({ id: 'close' })}
          isOpen={showModal}
          onCrossClick={closeModal}
          className="map-routing-modal"
          overlayClassName="map-routing-modal-overlay"
        >
          <h2 className="map-routing-modal-header">
            <FormattedMessage
              id="set-stop-as-routes"
              defaultMessage="Set stop as routes"
            />
          </h2>
          <div className="map-routing-modal-button-container">
            <button
              type="button"
              className="map-routing-modal-button"
              onClick={() => {
                onSelectLocation(stop, 'origin');
              }}
            >
              <FormattedMessage id="as-origin" defaultMessage="Route to stop" />
            </button>
            {config.viaPointsEnabled && (
              <button
                type="button"
                className="map-routing-modal-button"
                onClick={() => {
                  onSelectLocation(stop, 'via');
                }}
              >
                <FormattedMessage
                  id="as-viapoint"
                  defaultMessage="Route to stop"
                />
              </button>
            )}
            <button
              type="button"
              className="map-routing-modal-button"
              onClick={() => {
                onSelectLocation(stop, 'destination');
              }}
            >
              <FormattedMessage
                id="as-destination"
                defaultMessage="Route to stop"
              />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

MapRoutingButton.propTypes = {
  stop: PropTypes.object.isRequired,
};

MapRoutingButton.defaultProps = {};

MapRoutingButton.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
  config: PropTypes.object.isRequired,
  executeAction: PropTypes.func.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default MapRoutingButton;
