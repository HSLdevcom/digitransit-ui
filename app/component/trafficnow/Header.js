import { FormattedMessage } from 'react-intl';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import Icon from '../Icon';
import { useBreakpoint } from '../../util/withBreakpoint';

export default function Header() {
  const breakpoint = useBreakpoint();

  const mobile = breakpoint !== 'large';
  return (
    <div
      className={cx('traffic-now__header', {
        'traffic-now__header--mobile': mobile,
      })}
    >
      <span className="traffic-now__header-breadcrumb">
        <Link to="/">
          <FormattedMessage id="trafficnow-bread" />
        </Link>
        &nbsp;
        <Icon
          img="icon_arrow-dropdown"
          className="traffic-now__header-crumbarrow"
        />
        &nbsp;
        <FormattedMessage id="trafficnow" />
      </span>
      <h2>
        <FormattedMessage id="trafficnow" />
      </h2>
      <span className="traffic-now__header-description">
        <FormattedMessage id="trafficnow-description" />
      </span>
    </div>
  );
}

Header.propTypes = {};
Header.defaultProps = {};
