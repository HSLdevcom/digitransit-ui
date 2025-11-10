import React, { Suspense } from 'react';
import cx from 'classnames';
// import Button from '@hsl-fi/button';
import Header from './Header';
// import Filters from './Filters';
import Alerts from './Alerts';
import { useBreakpoint } from '../../util/withBreakpoint';
import Gutterer from '../Gutterer';
import Loading from '../Loading';

export default function TrafficNow() {
  const breakpoint = useBreakpoint();

  const mobile = breakpoint !== 'large';

  return (
    <div className={cx('traffic-now')}>
      <Gutterer maxWidth="1440px">
        <Header />
      </Gutterer>
      <div className="separator horizontal" />
      <Gutterer
        maxWidth="1440px"
        leftGutterStyles={{
          backgroundColor: 'var(--white)',
        }}
        rightGutterStyles={{
          backgroundColor: 'var(--background-color-lighter)',
        }}
        containerStyles={{ height: '100%' }}
      >
        <div
          className={cx('traffic-now__bottom', {
            'traffic-now__bottom--mobile': mobile,
            'flex-column': mobile,
            'flex-row': !mobile,
          })}
        >
          {/* !mobile ? (
            <Filters />
          ) : (
            <Button
              size="medium"
              fullWidth
              variant="blue"
              value="Suodattimet"
            />
          ) */}
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
