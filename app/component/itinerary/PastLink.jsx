import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { matchShape } from '../../../utils/client/shapes';

const PastLink = ({ match }) => (
  <div>
    <a className={cx('no-decoration', 'medium')} href={match.location.pathname}>
      <FormattedMessage id="itinerary-in-the-past-link" defaultMessage="" />
    </a>
  </div>
);

PastLink.propTypes = {
  match: matchShape.isRequired,
};

export default PastLink;
