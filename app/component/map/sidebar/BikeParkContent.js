import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { graphql, QueryRenderer } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import SidebarContainer from './SidebarContainer';

const BikeParkContent = ({ match }, { intl }) => {
  const { lat, lng, id } = match.location.query;

  const getCapacity = props => {
    if (props?.vehicleParking?.capacity) {
      const maxCapacity = props.vehicleParking.capacity.bicycleSpaces;
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
    }
    return null;
  };

  const getName = props => {
    if (props?.vehicleParking?.name) {
      const { name } = props.vehicleParking;
      const cleaned = name.replace('Bicycle parking', '').trim();
      if (cleaned.length) {
        return cleaned;
      }
      return intl.formatMessage({
        id: 'bicycle-parking',
        defaultMessage: 'Bicycle parking',
      });
    }
    return '';
  };

  const getBookingButton = props => {
    if (props?.vehicleParking?.detailsUrl) {
      return (
        <div style={{ padding: '15px 0px' }}>
          <a
            style={{ textDecoration: 'none' }}
            // eslint-disable-next-line react/jsx-no-target-blank
            target="_blank"
            className="standalone-btn"
            href={props.vehicleParking.detailsUrl}
          >
            <FormattedMessage id="book-locker" defaultMessage="Book locker" />
          </a>
        </div>
      );
    }
    return [];
  };

  return (
    <ReactRelayContext.Consumer>
      {({ environment }) => (
        <QueryRenderer
          environment={environment}
          variables={{
            id,
          }}
          query={graphql`
            query BikeParkContentQuery($id: String!) {
              vehicleParking: vehicleParking(id: $id) {
                vehicleParkingId
                name
                lon
                lat
                detailsUrl
                tags
                detailsUrl
                capacity {
                  bicycleSpaces
                }
                availability {
                  bicycleSpaces
                }
              }
            }
          `}
          render={({ props }) => (
            <SidebarContainer
              name={getName(props)}
              location={{
                address: getName(props),
                lat: Number(lat),
                lon: Number(lng),
              }}
            >
              {getCapacity(props)}
              {getBookingButton(props)}
            </SidebarContainer>
          )}
        />
      )}
    </ReactRelayContext.Consumer>
  );
};

BikeParkContent.displayName = 'BikeParkContent';

BikeParkContent.contextTypes = {
  intl: intlShape.isRequired,
};

BikeParkContent.propTypes = {
  match: PropTypes.object.isRequired,
  vehicleParking: PropTypes.object,
};

export default BikeParkContent;
