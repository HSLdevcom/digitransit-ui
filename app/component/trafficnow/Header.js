import { FormattedMessage } from 'react-intl';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import Icon from '../Icon';

export default function Header() {
  return (
    <div className={cx('header')}>
      <span className="breadcrumb">
        <Link to="/">
          <FormattedMessage id="trafficnow-bread" />
        </Link>
        &nbsp;
        <Icon img="icon_arrow-dropdown" className="crumbarrow" />
        &nbsp;
        <FormattedMessage id="trafficnow" />
      </span>
      <h2>
        <FormattedMessage id="trafficnow" />
      </h2>
      <span className="description">
        <FormattedMessage id="trafficnow-description" />
      </span>
    </div>
  );
}

Header.propTypes = {};
Header.defaultProps = {};
