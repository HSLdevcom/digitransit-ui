/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

const CapacityModal = () => {
  return (
    <div className="capacity-information-modal">
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
      <span className="explanations-heading">
        <FormattedMessage id="capacity-modal.legend" defaultMessage="Legend" />
      </span>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon
            img="icon-icon_MANY_SEATS_AVAILABLE"
            color="red"
            width="1.5"
            height="1.5"
          />
        </div>
        <span className="info-heading">
          <FormattedMessage
            id="capacity-modal.many-seats-available-heading"
            defaultMessage="Not crowded"
          />
        </span>
      </div>
      <p className="capacity-info-explanation">
        <FormattedMessage
          id="capacity-modal.many-seats-available-body"
          defaultMessage="Plenty of seats available"
        />
      </p>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon
            img="icon-icon_FEW_SEATS_AVAILABLE"
            color="red"
            width="1.5"
            height="1.5"
          />
        </div>
        <span className="info-heading">
          <FormattedMessage
            id="capacity-modal.few-seats-available-heading"
            defaultMessage="Not too crowded"
          />
        </span>
      </div>
      <p className="capacity-info-explanation">
        <FormattedMessage
          id="capacity-modal.few-seats-available-body"
          defaultMessage="Some seats available"
        />
      </p>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon
            img="icon-icon_STANDING_ROOM_ONLY"
            color="red"
            width="1.5"
            height="1.5"
          />
        </div>
        <span className="info-heading">
          <FormattedMessage
            id="capacity-modal.standing-room-only-heading"
            defaultMessage="Nearly full"
          />
        </span>
      </div>
      <p className="capacity-info-explanation">
        <FormattedMessage
          id="capacity-modal.standing-room-only-body"
          defaultMessage="Only a few seats and a little standing room available"
        />
      </p>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon
            img="icon-icon_CRUSHED_STANDING_ROOM_ONLY"
            color="red"
            width="1.5"
            height="1.5"
          />
        </div>
        <span className="info-heading">
          <FormattedMessage
            id="capacity-modal.crushed-standing-room-only-heading"
            defaultMessage="Very crowded"
          />
        </span>
      </div>
      <p className="capacity-info-explanation">
        <FormattedMessage
          id="capacity-modal.crushed-standing-room-only-body"
          defaultMessage="Only a little standing room available"
        />
      </p>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon img="icon-icon_FULL" color="red" width="1.5" height="1.5" />
        </div>
        <span className="info-heading">
          <FormattedMessage
            id="capacity-modal.full-capacity-heading"
            defaultMessage="Full"
          />
        </span>
      </div>
      <p className="capacity-info-explanation">
        <FormattedMessage
          id="capacity-modal.full-capacity-body"
          defaultMessage="No seats or standing room available"
        />
      </p>
    </div>
  );
};

CapacityModal.propTypes = {};

CapacityModal.defaultProps = {};

export default CapacityModal;
