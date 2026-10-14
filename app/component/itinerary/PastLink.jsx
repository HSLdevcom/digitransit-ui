import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { useMatch } from 'found';

const PastLink = () => {
  const match = useMatch();
  return (
    <div>
      <a
        className={cx('no-decoration', 'medium')}
        href={match.location.pathname}
      >
        <FormattedMessage id="itinerary-in-the-past-link" defaultMessage="" />
      </a>
    </div>
  );
};

export default PastLink;
