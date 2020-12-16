import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { QueryRenderer, ReactRelayContext } from 'react-relay';
import { matchShape } from 'found';
import SummaryPage from './SummaryPage';
import { validateServiceTimeRange } from '../util/timeUtils';
import { planQuery } from '../util/queryUtils';
import { preparePlanParams } from '../util/planParamUtil';

const SummaryPageContainer = ({ content, map, match }, { config }) => {
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
            content={content}
            map={map}
            match={match}
            error={error}
            loading={false}
          />
        ) : (
          <SummaryPage
            content={content}
            map={map}
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
      content={content}
      map={map}
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
  content: PropTypes.node,
  map: PropTypes.node,
  match: matchShape.isRequired,
};

export default SummaryPageContainer;
