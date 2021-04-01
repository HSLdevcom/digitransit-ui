import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { intlShape } from 'react-intl';
import BikeParkOrStationHeader from './BikeParkOrStationHeader';
import Icon from './Icon';

const BikeParkContent = ({ bikePark }, { intl }) => {
  return (
    <div className="bike-station-page-container">
      <BikeParkOrStationHeader bikeParkOrStation={bikePark} />
      <div className="bikepark-content-container">
        <Icon img="icon-icon_bikepark" height={2.4} width={2.4} />
        <div className="bikepark-details">
          <span>
            {intl.formatMessage({ id: 'is-open' })} &#160;
            <p>24{intl.formatMessage({ id: 'hour-short' })}</p>
          </span>
          <span>
            {intl.formatMessage({ id: 'number-of-spaces' })} &#160;
            <p>{bikePark.spacesAvailable}</p>
          </span>
          <span>{intl.formatMessage({ id: 'free-of-charge' })}</span>
        </div>
      </div>
      <div className="citybike-use-disclaimer">
        <div className="disclaimer-header">
          {intl.formatMessage({ id: 'bike-park-disclaimer-header' })}
        </div>
        <div className="disclaimer-content">
          {intl.formatMessage({ id: 'bike-park-disclaimer' })}
        </div>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          onClick={e => {
            e.stopPropagation();
          }}
          className="external-link"
          href="#"
        >
          {intl.formatMessage({ id: 'bike-park-disclaimer-link' })} &rsaquo;
        </a>
      </div>
    </div>
  );
};

BikeParkContent.propTypes = {
  bikePark: PropTypes.shape({
    bikeParkId: PropTypes.string,
    spacesAvailable: PropTypes.number,
    name: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
};

BikeParkContent.contextTypes = {
  intl: intlShape.isRequired,
};

const containerComponent = createFragmentContainer(BikeParkContent, {
  bikePark: graphql`
    fragment BikeParkContent_bikePark on BikePark {
      bikeParkId
      spacesAvailable
      name
      lat
      lon
    }
  `,
});

export { containerComponent as default, BikeParkContent as Component };
