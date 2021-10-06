import PropTypes from 'prop-types';
import React, { useState } from 'react';
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

const MapRoutingButton = ({ stop }, { intl, router, match }) => {
  const [showModal, setShowModal] = useState(false);

  const { location } = match;
  const closeModal = () => setShowModal(false);

  const onSelectLocation = (item, id) => {
    // eslint-disable-next-line no-param-reassign
    item = { ...item, address: item.name };
    if (id === 'origin') {
      const newLocation = {
        ...location,
        pathname: getPathWithEndpointObjects(
          item,
          {},
          PREFIX_ITINERARY_SUMMARY,
        ),
      };
      router.push(newLocation);
    } else if (id === 'destination') {
      const newLocation = {
        ...location,
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
        <FormattedMessage id="route-to-stop" defaultMessage="Route to stop" />
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
