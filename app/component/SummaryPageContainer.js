import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ReactRelayContext } from 'react-relay';
import { matchShape } from 'found';
import Loading from './Loading';
import { validateServiceTimeRange } from '../util/timeUtils';
import { planQuery } from '../util/queryUtils';
import { preparePlanParams } from '../util/planParamUtil';
import LazilyLoad, { importLazy } from './LazilyLoad';

const modules = {
  QueryRenderer: () =>
    importLazy(import('react-relay/lib/ReactRelayQueryRenderer')),
  SummaryPage: () => importLazy(import('./SummaryPage')),
};

const SummaryPageContainer = ({ content, match }, { config }) => {
  const { environment } = useContext(ReactRelayContext);
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });
  return isClient ? (
    <LazilyLoad modules={modules}>
      {({ QueryRenderer, SummaryPage }) => (
        <QueryRenderer
          query={planQuery}
          variables={preparePlanParams(config, false)(match.params, match)}
          environment={environment}
          render={({ props: innerProps, error }) => {
            return innerProps ? (
              <SummaryPage
                {...innerProps}
                content={content}
                match={match}
                error={error}
                loading={false}
              />
            ) : (
              <SummaryPage
                content={content}
                match={match}
                viewer={{ plan: {} }}
                serviceTimeRange={validateServiceTimeRange()}
                loading
                error={error}
              />
            );
          }}
        />
      )}
    </LazilyLoad>
  ) : (
    <Loading />
  );
};

SummaryPageContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

SummaryPageContainer.propTypes = {
  content: PropTypes.node,
  match: matchShape.isRequired,
};

export default SummaryPageContainer;
