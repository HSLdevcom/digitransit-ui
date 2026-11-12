import { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { Button, FlexColumn } from '@hsl-fi/layout-primitives';
import { useRouter } from 'found';
import { stopShape } from '../../../utils/client/shapes';
import Icon from '../Icon';
import { locationToUri, locationToOTP } from '../../../utils/shared/otpStrings';
import {
  getPathWithEndpointObjects,
  getItineraryPagePath,
  PREFIX_ITINERARY_SUMMARY,
} from '../../../utils/shared/path';
import { useConfigContext } from '../../hooks/ConfigContext';

export default function StopItineraryButton({ stop }) {
  const intl = useIntl();
  const config = useConfigContext();
  const { router, match } = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [buttonText, setButtonText] = useState(null);
  useEffect(() => {
    if (stop?.vehicleParkingId) {
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
  const time = Math.floor(Date.now() / 1000);
  const onSelectLocation = (item, id) => {
    const address =
      item.name.toLowerCase() === 'scooter'
        ? intl.formatMessage({ id: 'e-scooter' })
        : item.name;
    let newLocation;
    const place = {
      ...item,
      address,
      gtfsId: match.params.stopId || match.params.terminalId,
    };
    if (id === 'origin') {
      newLocation = {
        ...locationWithoutQuery,
        pathname: getPathWithEndpointObjects(
          place,
          {},
          PREFIX_ITINERARY_SUMMARY,
        ),
        query: { time },
      };
    } else if (id === 'destination') {
      newLocation = {
        ...locationWithoutQuery,
        pathname: getPathWithEndpointObjects(
          {},
          place,
          PREFIX_ITINERARY_SUMMARY,
        ),
        query: { time },
      };
    } else {
      newLocation = {
        ...location,
        pathname: getItineraryPagePath(locationToUri({}), locationToUri({})),
        query: {
          intermediatePlaces: locationToOTP(item),
          query: { time },
        },
      };
    }
    router.push(newLocation);
  };

  return (
    <>
      <button
        type="button"
        className="stop-itinerary-button"
        onClick={() => {
          setShowModal(true);
        }}
      >
        <Icon className="stop-itinerary-button-icon" img="icon_route" />
        {buttonText && (
          <FormattedMessage id={buttonText} defaultMessage="Route to stop" />
        )}
      </button>
      {showModal && (
        <Modal lang={config.language} open onOpenChange={closeModal}>
          <ModalContent
            title={intl.formatMessage({
              id: 'set-stop-as-routes',
              defaultMessage: 'Set stop as routes',
            })}
            lang={config.language}
            className="stop-itinerary-modal-sheet"
          >
            <FlexColumn gap="xs">
              <Button
                variant="secondary"
                expand
                onClick={() => onSelectLocation(stop, 'origin')}
              >
                {intl.formatMessage({
                  id: 'as-origin',
                  defaultMessage: 'Route to stop',
                })}
              </Button>
              {config.viaPointsEnabled && (
                <Button
                  variant="secondary"
                  expand
                  onClick={() => onSelectLocation(stop, 'via')}
                >
                  {intl.formatMessage({
                    id: 'as-viapoint',
                    defaultMessage: 'Route to stop',
                  })}
                </Button>
              )}
              <Button
                variant="secondary"
                expand
                onClick={() => onSelectLocation(stop, 'destination')}
              >
                {intl.formatMessage({
                  id: 'as-destination',
                  defaultMessage: 'Route to stop',
                })}
              </Button>
            </FlexColumn>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

StopItineraryButton.propTypes = { stop: stopShape.isRequired };
