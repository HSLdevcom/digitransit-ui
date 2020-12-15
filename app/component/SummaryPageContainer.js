import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { QueryRenderer, ReactRelayContext } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEqual from 'lodash/isEqual';
import { matchShape, routerShape } from 'found';
import { startLocationWatch } from '../action/PositionActions';
import SummaryPage from './SummaryPage';
import { isBrowser } from '../util/browser';
import { addressToItinerarySearch } from '../util/otpStrings';
import { validateServiceTimeRange } from '../util/timeUtils';
import { planQuery } from '../util/queryUtils';
import { preparePlanParams } from '../util/planParamUtil';

const SummaryPageContainer = ({ match }, { config }) => {
  const { environment } = useContext(ReactRelayContext);
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    // To prevent SSR for rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });

  return isClient ? (
    <QueryRenderer
      query={planQuery}
      variables={preparePlanParams(config, false)(match.params, match)}
      environment={environment}
      render={({ props: innerProps, error }) => {
        return innerProps ? (
          <SummaryPage
            {...innerProps}
            match={match}
            error={error}
            loading={false}
          />
        ) : (
          <SummaryPage
            match={match}
            viewer={{ plan: {} }}
            serviceTimeRange={validateServiceTimeRange()}
            loading
            error={error}
          />
        );
      }}
    />
  ) : (
    <SummaryPage
      match={match}
      viewer={{ plan: {} }}
      serviceTimeRange={validateServiceTimeRange()}
      loading
    />
  );
};

SummaryPageContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

SummaryPageContainer.propTypes = {
  match: matchShape.isRequired,
};

const SummaryPageContainerWithPosition = connectToStores(
  SummaryPageContainer,
  ['PositionStore'],
  (context, props) => {
    const { from, to } = props.match.params;
    if (from !== 'POS' && to !== 'POS') {
      return props;
    }

    const locationState = context.getStore('PositionStore').getLocationState();
    const { createReturnPath, path } = props;

    const redirect = () => {
      const locationForUrl = addressToItinerarySearch(locationState);
      const newFrom = from === undefined ? locationForUrl : from;
      let newTo;
      if (locationForUrl && isEqual(locationForUrl, newFrom)) {
        newTo = to === undefined || to === 'POS' ? '-' : to;
      } else {
        newTo = to === undefined || to === 'POS' ? locationForUrl : to;
      }
      const returnPath = createReturnPath(path, newFrom, newTo);

      const newLocation = {
        ...props.match.location,
        pathname: returnPath,
      };
      props.router.replace(newLocation);
    };

    if (isBrowser) {
      if (locationState.locationingFailed) {
        redirect();
      }
      if (locationState.hasLocation === false) {
        if (
          !locationState.isLocationingInProgress &&
          locationState.status === 'no-location'
        ) {
          context.executeAction(startLocationWatch);
        }
      } else if (
        locationState.hasLocation &&
        !locationState.isReverseGeocodingInProgress
      ) {
        redirect();
      }
    }
    return {};
  },
);

SummaryPageContainerWithPosition.contextTypes = {
  ...SummaryPageContainerWithPosition.contextTypes,
  executeAction: PropTypes.func.isRequired,
};
SummaryPageContainerWithPosition.propTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  path: PropTypes.string.isRequired,
  createReturnPath: PropTypes.func.isRequired,
};

export default SummaryPageContainerWithPosition;
