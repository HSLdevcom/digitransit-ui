import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { useMatch } from 'found';

export default function ChangeDepartureTimeLink() {
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
}
