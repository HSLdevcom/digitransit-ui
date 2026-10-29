import React from 'react';
import { FormattedMessage } from 'react-intl';
import Loading from '../Loading';

export default function OverlayWithSpinner() {
  return (
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
}
