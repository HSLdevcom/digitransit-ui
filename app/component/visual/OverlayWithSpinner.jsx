import React from 'react';
import { FormattedMessage } from 'react-intl';
import Loading from '../Loading.jsx';

const OverlayWithSpinner = () => (
  <div className="overlay-with-spinner">
    <div>
      <Loading />
    </div>
    <FormattedMessage
      id="searching-position"
      defaultMessage="Detecting location..."
    />
  </div>
);

export default OverlayWithSpinner;
