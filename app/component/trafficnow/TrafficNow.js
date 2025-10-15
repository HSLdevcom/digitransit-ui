import React, { Suspense } from 'react';
import cx from 'classnames';
import Button from '@hsl-fi/button';
import Header from './Header';
import Filters from './Filters';
import Alerts from './Alerts';
import { useBreakpoint } from '../../util/withBreakpoint';
import Gutterer from '../Gutterer';
import Loading from '../Loading';

export default function TrafficNow() {
  const breakpoint = useBreakpoint();

  const desktop = breakpoint === 'large';

  return (
    <div className={cx('traffic-now')}>
      <Gutterer
        maxWidth="1440px"
        leftGutterPadding={desktop ? '0 50px 0 0' : '0 20px 0 0'}
      >
        <Header />
      </Gutterer>
      <div className="separator horizontal" />
      <Gutterer
        maxWidth="1440px"
        leftBg="#fff"
        rightBg="#f2f5f7"
        leftGutterPadding={desktop ? '0 50px 0 0' : undefined}
      >
        <div
          className={cx('bottom', desktop ? 'flex-row desktop' : 'flex-column')}
        >
          {desktop ? (
            <Filters />
          ) : (
            <Button
              size="medium"
              fullWidth
              variant="blue"
              value="Suodattimet"
            />
          )}
          <Suspense fallback={<Loading />}>
            <Alerts />
          </Suspense>
        </div>
      </Gutterer>
    </div>
  );
}

TrafficNow.propTypes = {};

TrafficNow.defaultProps = {};
