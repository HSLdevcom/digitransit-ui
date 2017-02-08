import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const Distance = (props) => {
  let approxDistance;

  if (this.props.distance > 0) {
    approxDistance = Math.round(props.distance / 50) * 50;

    if (approxDistance > 50) {
      return (
        <FormattedMessage
          id="approx-meters"
          values={{ approxDistance }}
          defaultMessage="{approxDistance} m"
        />
      );
    }
  }

  return null;
};

Distance.propTypes = {
  distance: PropTypes.number.isRequired,
};

export default Distance;
