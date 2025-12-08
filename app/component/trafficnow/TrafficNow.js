import React, { Suspense, useState } from 'react';
import cx from 'classnames';
import Button from '@hsl-fi/button';
import Header from './Header';
import Filters from './filters/Filters';
import FiltersModal from './filters/FiltersModal';
import Alerts from './Alerts';
import { useBreakpoint } from '../../util/withBreakpoint';
import Gutterer from '../Gutterer';
import Loading from '../Loading';
import { FilterContextProvider } from './filters/FiltersContext';

export default function TrafficNow() {
  const breakpoint = useBreakpoint();
  const [showFiltersModal, setShowFiltersModal] = useState(false);

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
      >
        <div
          className={cx('traffic-now__content', {
            'traffic-now__content--mobile': mobile,
            'flex-column': mobile,
            'flex-row': !mobile,
          })}
        >
          <FilterContextProvider>
            {!mobile ? (
              <div className="traffic-now__content__filters-container">
                <Filters />
              </div>
            ) : (
              <>
                <FiltersModal
                  isOpen={showFiltersModal}
                  onClose={() => setShowFiltersModal(false)}
                />
                <Button
                  size="medium"
                  fullWidth
                  variant="blue"
                  value="Suodattimet"
                  onClick={() => setShowFiltersModal(true)}
                />
              </>
            )}
            <Suspense fallback={<Loading />}>
              <Alerts />
            </Suspense>
          </FilterContextProvider>
        </div>
      </Gutterer>
    </div>
  );
}

TrafficNow.propTypes = {};

TrafficNow.defaultProps = {};
