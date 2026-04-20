import Button from '@hsl-fi/button';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { configShape } from '../../../../util/shapes';

const NaviGeolocationInfo = ({ logo, onClose }) => {
  const intl = useIntl();
  return (
    <div className="geolocation-body">
      {logo && <img src={logo} alt="navigator geolocation graphic" />}
      <FormattedMessage tagName="h2" id="navi-geolocation-approval" />
      <FormattedMessage tagName="p" id="navi-geolocation-details" />
      <Button
        size="large"
        fullWidth
        variant="white"
        value={intl.formatMessage({ id: 'back' })}
        onClick={onClose}
      />
    </div>
  );
};

NaviGeolocationInfo.propTypes = {
  logo: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

NaviGeolocationInfo.defaultProps = {
  logo: undefined,
};

NaviGeolocationInfo.contextTypes = {
  config: configShape.isRequired,
};

export default NaviGeolocationInfo;
