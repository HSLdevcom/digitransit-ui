import Button from '@hsl-fi/button';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { addAnalyticsEvent } from '../../../../util/analyticsUtils';

const NavigatorOutro = ({ onClose, destination, logo }, context) => {
  const { intl } = context;
  const [place, address] = destination?.split(/, (.+)/) || [];

  useEffect(
    () =>
      addAnalyticsEvent({
        category: 'Itinerary',
        event: 'navigator',
        action: 'navigaton_end',
      }),
    [],
  );

  return (
    <>
      <div className="outro-logo-container">
        {logo && <img src={logo} alt="Navigator outro icon" />}
      </div>
      <div className="outro-body">
        <FormattedMessage
          tagName="h2"
          id="navigation-outro-header"
          defaultMessage="You have arrived!"
        />
        <div className="destination">
          <p className="place">{place}</p>
          <p className="address">{address}</p>
        </div>
      </div>
      <div className="outro-buttons">
        <Button
          className="close-button"
          size="large"
          fullWidth
          value={intl.formatMessage({
            id: 'navigation-outro-dismiss',
            defaultMessage: 'Exit Navigator',
          })}
          onClick={onClose}
          variant="black"
        />
      </div>
    </>
  );
};

NavigatorOutro.propTypes = {
  onClose: PropTypes.func.isRequired,
  destination: PropTypes.string.isRequired,
  logo: PropTypes.string,
};

NavigatorOutro.defaultProps = {
  logo: undefined,
};

NavigatorOutro.contextTypes = {
  intl: intlShape.isRequired,
};

export default NavigatorOutro;
