import { useIntl } from 'react-intl';
import cx from 'classnames';
import React, { useEffect, Suspense, useState } from 'react';
import Button from '@hsl-fi/button';
import { useRouter } from 'found';
import ReactModal from 'react-modal';
import { useBreakpoint } from '../../util/withBreakpoint';
import scrollTop from '../../util/scroll';
import Gutterer from '../Gutterer';
import Loading from '../Loading';
import CanceledTripsContainer from './CanceledTripsContainer';
import DisruptionDetailsContainer from './DisruptionDetailsContainer';
import Disruptions from './Disruptions';
import TrafficNowFooter from './TrafficNowFooter';
import TrafficNowHeader from './TrafficNowHeader';
import Filters from './filters/Filters';
import { FilterContextProvider } from './filters/FiltersContext';
import FiltersModal from './filters/FiltersModal';

// defines the scroll position at which a drop shadow is applied to the header button on mobile
const HEADER_HEIGHT = 320;

const TrafficNow = () => {
  const {
    match: {
      params: { mode, alertId },
    },
  } = useRouter();
  const intl = useIntl();
  const breakpoint = useBreakpoint();
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const mobile = breakpoint !== 'large';

  useEffect(() => ReactModal.setAppElement(document.querySelector('#app')), []);

  useEffect(() => {
    scrollTop();
  }, [mode, alertId]);

  const isMobileCanceledTripsView = !!mode && mobile;
  const isDetailsView = !!alertId;

  const [top, setTop] = useState(true);

  useEffect(() => {
    const scrollHandler = () => {
      setTop(window.scrollY <= HEADER_HEIGHT);
    };
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  return (
    <div className="traffic-now design-system">
      {!isMobileCanceledTripsView && !(isDetailsView && mobile) && (
        <>
          <Gutterer maxWidth="1440px" contentStyles={{ display: 'flex' }}>
            <TrafficNowHeader />
          </Gutterer>
          <div className="separator horizontal" />
        </>
      )}
      <Gutterer
        maxWidth="1440px"
        containerStyles={{ height: '100%' }}
        leftGutterStyles={{
          backgroundColor: 'var(--white)',
        }}
        rightGutterStyles={{
          backgroundColor: 'var(--background-color-lighter)',
        }}
      >
        <div
          className={cx('traffic-now__body', {
            'traffic-now__body--mobile': mobile,
          })}
        >
          <FilterContextProvider>
            {alertId && (
              <Suspense fallback={<Loading />}>
                <DisruptionDetailsContainer
                  alertId={alertId}
                  isMobile={mobile}
                />
              </Suspense>
            )}
            {!alertId && mode && (
              <Suspense fallback={<Loading />}>
                <CanceledTripsContainer mode={mode} isMobile={mobile} />
              </Suspense>
            )}
            {!alertId && !mode && (
              <>
                {!mobile ? (
                  <div className="traffic-now__filters-container">
                    <Filters />
                  </div>
                ) : (
                  <div
                    className={cx(
                      'traffic-now__filters-button-container',
                      !top && 'scrolled',
                    )}
                  >
                    <FiltersModal
                      isOpen={showFiltersModal}
                      onClose={() => setShowFiltersModal(false)}
                    />
                    <Button
                      className="traffic-now__filters-button"
                      size="medium"
                      fullWidth
                      variant="blue"
                      value={intl.formatMessage({
                        id: 'filters',
                        defaultMessage: 'Filters',
                      })}
                      onClick={() => setShowFiltersModal(true)}
                    />
                  </div>
                )}
                <Suspense fallback={<Loading />}>
                  <Disruptions />
                </Suspense>
              </>
            )}
          </FilterContextProvider>
        </div>
      </Gutterer>
      <TrafficNowFooter />
    </div>
  );
};

export default TrafficNow;
