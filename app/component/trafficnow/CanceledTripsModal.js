import React from 'react';
import Button from '@hsl-fi/button';
import Modal from '@hsl-fi/modal';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useRouter } from 'found';
import { PREFIX_TIMETABLE, routePagePath } from '../../util/path';
import Icon from '../Icon';
import IconBackground from '../icon/IconBackground';
import PatternWithCancellations from './components/PatternWithCancellations';
import RouteBadgeGroup from './components/RouteBadgeGroup';

const CanceledTripsModal = ({
  mode,
  detailsKey = undefined,
  trips,
  onClose,
}) => {
  const intl = useIntl();
  const { router } = useRouter();

  const handleRouteBadgeClick = url => e => {
    e.preventDefault();
    router.push(url);
  };

  return (
    <Modal
      appElement="#app"
      isOpen={!!detailsKey}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      contentLabel="Canceled trips modal"
      onRequestClose={onClose}
      variant="large"
      className="traffic-now traffic-now__modal sheet design-system"
      overlayClassName="traffic-now__modal-overlay"
    >
      <header className="traffic-now__modal-header">
        <RouteBadgeGroup
          mode={mode}
          headsignGroupClassName={mode}
          routes={[
            {
              id: detailsKey,
              name: detailsKey,
              url: routePagePath(
                trips[detailsKey].routeGtfsId,
                PREFIX_TIMETABLE,
              ),
              gtfsId: trips[detailsKey].routeGtfsId,
            },
          ]}
        />
        <button type="button" onClick={onClose}>
          <Icon
            height={2}
            width={2}
            iconScale={0.4}
            img="icon_close"
            color="#007ac9"
            background={<IconBackground shape="circle" color="#ebf6fd" />}
          />
        </button>
      </header>
      <div className="traffic-now__modal-cancellations">
        {Object.entries(trips[detailsKey].patterns).map(
          ([patternCode, pattern], i, arr) => (
            <React.Fragment key={`${patternCode}-${pattern.trip.tripId}`}>
              <div className="traffic-now__modal-cancellations-pattern">
                <PatternWithCancellations
                  pattern={pattern}
                  withDepartureBadges
                />
                <Button
                  className="routepage-button link-bold-small"
                  size="small"
                  fullWidth={false}
                  variant="white"
                  value={intl.formatMessage({
                    id: 'traffic-now_go-to-route-page',
                  })}
                  href={routePagePath(
                    trips[detailsKey].routeGtfsId,
                    PREFIX_TIMETABLE,
                    patternCode,
                  )}
                  onLinkClick={handleRouteBadgeClick(
                    routePagePath(
                      trips[detailsKey].routeGtfsId,
                      PREFIX_TIMETABLE,
                      patternCode,
                    ),
                  )}
                />
              </div>
              {i + 1 < arr.length && (
                <div className="separator horizontal padded-xs" />
              )}
            </React.Fragment>
          ),
        )}
      </div>
    </Modal>
  );
};

CanceledTripsModal.propTypes = {
  mode: PropTypes.string.isRequired,
  detailsKey: PropTypes.string,
  trips: PropTypes.shape({}).isRequired,
  onClose: PropTypes.func.isRequired,
  appElement: PropTypes.shape({}),
};

export default CanceledTripsModal;
