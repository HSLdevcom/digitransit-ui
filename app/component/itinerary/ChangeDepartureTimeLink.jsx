import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { useMatch } from 'found';

const ChangeDepartureTimeLink = () => {
  const match = useMatch();
  return (
    <div>
      <a
        className={cx('no-decoration', 'medium')}
        href={match.location.pathname}
      >
        <FormattedMessage id="router-change-departure-time" defaultMessage="" />
      </a>
    </div>
  );
};

export default ChangeDepartureTimeLink;
