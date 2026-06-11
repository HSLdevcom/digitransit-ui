import PropTypes from 'prop-types';
import React from 'react';
import { useRouter } from 'found';
import { FormattedMessage } from 'react-intl';
import OriginDestinationBar from './OriginDestinationBar';
import SearchSettings from './SearchSettings';
import { parseLocation, streetHash } from '../../util/path';
import withBreakpoint from '../../util/withBreakpoint';
import BackButton from '../BackButton';

function ItineraryPageControls({ breakpoint, toggleSettings }) {
  const { match } = useRouter();
  const { params } = match;

  const isMobile = breakpoint !== 'large';

  return (
    <div className="summary-navigation-container">
      {isMobile && (
        <BackButton
          title={
            <FormattedMessage
              id="summary-page.title"
              defaultMessage="Itinerary suggestions"
            />
          }
          fallback={
            params.hash === streetHash.bikeAndVehicle ||
            params.hash === streetHash.carAndVehicle ||
            params.hash === streetHash.parkAndRide
              ? 'pop'
              : undefined
          }
        />
      )}

      <span className="sr-only">
        <FormattedMessage
          id="search-fields.sr-instructions"
          defaultMessage="The search is triggered automatically when origin and destination are set. Changing any search parameters triggers a new search"
        />
      </span>

      <OriginDestinationBar
        origin={parseLocation(params.from)}
        destination={parseLocation(params.to)}
        isMobile={isMobile}
      />

      <SearchSettings toggleSettings={toggleSettings} />
    </div>
  );
}

ItineraryPageControls.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  toggleSettings: PropTypes.func.isRequired,
};

export default withBreakpoint(ItineraryPageControls);
