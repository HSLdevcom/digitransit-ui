import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import SidebarContainer from './SidebarContainer';

const BikeParkContent = ({ match }, { intl }) => {
  const { lat, lng, id } = match.location.query;

  const getCapacity = () => {
    const { maxCapacity } = match.location.query;
    if (maxCapacity > 0) {
      return (
        <span className="inline-block padding-vertical-small">
          <FormattedMessage
            id="parking-spaces-in-total"
            defaultMessage="{total} parking spaces"
            values={{ total: maxCapacity }}
          />
        </span>
      );
    }
    return null;
  };

  const getName = () => {
    const { name } = match.location.query;
    const cleaned = name.replace('Bicycle parking', '').trim();
    if (cleaned.length) {
      return cleaned;
    }
    return intl.formatMessage({
      id: 'bicycle-parking',
      defaultMessage: 'Bicycle parking',
    });
  };

  const name = getName();

  const getBookingButton = () => {
    if (id?.startsWith('open-bike-box')) {
      return (
        <div style={{ padding: '15px 0px' }}>
          <a
            style={{ textDecoration: 'none' }}
            // eslint-disable-next-line react/jsx-no-target-blank
            target="_blank"
            className="standalone-btn"
            href="https://openbikebox.de/"
          >
            <FormattedMessage id="book-locker" defaultMessage="Book locker" />
          </a>
        </div>
      );
    }
    return [];
  };

  return (
    <SidebarContainer
      name={name}
      location={{
        address: name,
        lat: Number(lat),
        lon: Number(lng),
      }}
    >
      {getCapacity()}
      {getBookingButton()}
    </SidebarContainer>
  );
};

BikeParkContent.displayName = 'BikeParkContent';

BikeParkContent.contextTypes = {
  intl: intlShape.isRequired,
};

BikeParkContent.propTypes = {
  match: PropTypes.object.isRequired,
};

export default BikeParkContent;
