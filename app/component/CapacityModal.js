/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

const CapacityModal = ({ config }) => {
  return (
    <div className="capacity-information-modal">
      <section>
        <h2 className="capacity-heading">
          <FormattedMessage
            id="capacity-modal.heading"
            defaultMessage="Is there room in the vehicle?"
          />
        </h2>
        <p className="capacity-text">
          <FormattedMessage
            id="capacity-modal.subheading"
            defaultMessage="Real-time capacity information is available for some vehicles"
          />
        </p>
      </section>
      <section>
        <h3 className="explanations-heading">
          <FormattedMessage
            id="capacity-modal.legend"
            defaultMessage="Legend"
          />
        </h3>
      </section>
      <section>
        <div className="capacity-info-row">
          <div className="icon" style={{ color: config.colors.primary }}>
            <Icon
              img="icon-icon_MANY_SEATS_AVAILABLE"
              width="1.5"
              height="1.5"
            />
          </div>
          <h4 className="info-heading">
            <FormattedMessage
              id="capacity-modal.many-seats-available-heading"
              defaultMessage="Not crowded"
            />
          </h4>
        </div>
        <p className="capacity-info-explanation">
          <FormattedMessage
            id="capacity-modal.many-seats-available-body"
            defaultMessage="Plenty of seats available"
          />
        </p>
      </section>
      <section>
        <div className="capacity-info-row">
          <div className="icon">
            <Icon
              img="icon-icon_FEW_SEATS_AVAILABLE"
              width="1.5"
              height="1.5"
              color={config.colors.primary}
            />
          </div>
          <h4 className="info-heading">
            <FormattedMessage
              id="capacity-modal.few-seats-available-heading"
              defaultMessage="Not too crowded"
            />
          </h4>
        </div>
        <p className="capacity-info-explanation">
          <FormattedMessage
            id="capacity-modal.few-seats-available-body"
            defaultMessage="Some seats available"
          />
        </p>
      </section>
      <section>
        <div className="capacity-info-row">
          <div className="icon">
            <Icon
              img="icon-icon_STANDING_ROOM_ONLY"
              width="1.5"
              height="1.5"
              color={config.colors.primary}
            />
          </div>
          <h4 className="info-heading">
            <FormattedMessage
              id="capacity-modal.standing-room-only-heading"
              defaultMessage="Nearly full"
            />
          </h4>
        </div>
        <p className="capacity-info-explanation">
          <FormattedMessage
            id="capacity-modal.standing-room-only-body"
            defaultMessage="Only a few seats and a little standing room available"
          />
        </p>
      </section>
      <section>
        <div className="capacity-info-row">
          <div className="icon">
            <Icon
              img="icon-icon_CRUSHED_STANDING_ROOM_ONLY"
              width="1.5"
              height="1.5"
              color={config.colors.primary}
            />
          </div>
          <h4 className="info-heading">
            <FormattedMessage
              id="capacity-modal.crushed-standing-room-only-heading"
              defaultMessage="Very crowded"
            />
          </h4>
        </div>
        <p className="capacity-info-explanation">
          <FormattedMessage
            id="capacity-modal.crushed-standing-room-only-body"
            defaultMessage="Only a little standing room available"
          />
        </p>
      </section>
      <section>
        <div className="capacity-info-row">
          <div className="icon">
            <Icon
              img="icon-icon_FULL"
              width="1.5"
              height="1.5"
              color={config.colors.primary}
            />
          </div>
          <h4 className="info-heading">
            <FormattedMessage
              id="capacity-modal.full-capacity-heading"
              defaultMessage="Full"
            />
          </h4>
        </div>
        <p className="capacity-info-explanation">
          <FormattedMessage
            id="capacity-modal.full-capacity-body"
            defaultMessage="No seats or standing room available"
          />
        </p>
      </section>
    </div>
  );
};

CapacityModal.propTypes = {
  config: PropTypes.object.isRequired,
};

CapacityModal.defaultProps = {};

export default CapacityModal;
