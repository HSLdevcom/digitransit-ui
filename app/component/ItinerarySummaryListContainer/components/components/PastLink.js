import React from 'react';
import { matchShape } from 'found';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';

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
