import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { matchShape } from '../../../utils/client/shapes';

const ChangeDepartureTimeLink = ({ match }) => (
  <div>
    <a className={cx('no-decoration', 'medium')} href={match.location.pathname}>
      <FormattedMessage id="router-change-departure-time" defaultMessage="" />
    </a>
  </div>
);

ChangeDepartureTimeLink.propTypes = {
  match: matchShape.isRequired,
};

export default ChangeDepartureTimeLink;
