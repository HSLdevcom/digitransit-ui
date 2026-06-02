import { useIntl } from 'react-intl';
import cx from 'classnames';
import React, { useEffect, Suspense, useState } from 'react';
import Button from '@hsl-fi/button';
import { useRouter } from 'found';
import ReactModal from 'react-modal';
import { useBreakpoint } from '../../util/withBreakpoint';
import Gutterer from '../Gutterer';
import Loading from '../Loading';
import CanceledTripsContainer from './CanceledTripsContainer';
import DisruptionDetailsContainer from './DisruptionDetailsContainer';
import Disruptions from './Disruptions';
import TrafficNowHeader from './TrafficNowHeader';
import Filters from './filters/Filters';
import { FilterContextProvider } from './filters/FiltersContext';
import FiltersModal from './filters/FiltersModal';

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

  const isMobileCanceledTripsView = !!mode && mobile;
  const isDetailsView = !!alertId;

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
                  <div className="traffic-now__filters-button-container">
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
    </div>
  );
};

export default TrafficNow;
