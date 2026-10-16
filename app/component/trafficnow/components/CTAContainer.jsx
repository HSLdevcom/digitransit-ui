import React from 'react';
import { Link } from 'found';
import { Text } from '@hsl-fi/layout-primitives';
import { Icon, ArrowLeft } from '@hsl-fi/icons';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';

const CTAContainer = ({ isMobile = false }) => {
  const { formatMessage } = useIntl();
  return (
    <div
      className={cx('detail-view__cta-container', {
        'detail-view__cta-container--mobile': isMobile,
      })}
    >
      <Link to="/liikenne">
        <Icon icon={ArrowLeft} color="accent" size="s" />
        <Text variant="cta-small" color="default">
          {formatMessage({ id: 'traffic-now_go-back' })}
        </Text>
        <div />
      </Link>
    </div>
  );
};

CTAContainer.propTypes = {
  isMobile: PropTypes.bool,
};

export default CTAContainer;
