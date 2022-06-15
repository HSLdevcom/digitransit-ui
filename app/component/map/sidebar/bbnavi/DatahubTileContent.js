import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import { FormattedMessage } from 'react-intl';

import SidebarContainer from '../SidebarContainer';
import Address from './section/Address';
import Contact from './section/Contact';
import OpeningHours from './section/OpeningHours';
import DataProvider from './section/DataProvider';

function fetchJSON(url, init = {}) {
  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  }).then(response => {
    if (!response.ok) {
      const error = new Error(
        `${url}: ${response.status} ${response.statusText}`,
      );
      error.url = response.url;
      error.response = response;
      throw error;
    }
    if (!response.headers.get('Content-Type').includes('application/json')) {
      const error = new Error(`${url}: unexpected Content-Type`);
      error.url = response.url;
      error.response = response;
      throw error;
    }
    return response.json();
  });
}

function fetchGraphQL(url, query, variables, headers = {}) {
  return fetchJSON(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
}

function fetchQuery(operation, variables, config) {
  const { DATAHUB_O_AUTH, URL } = config;

  const fetchBearerObj = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: DATAHUB_O_AUTH.CLIENT_ID,
      client_secret: DATAHUB_O_AUTH.CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  };

  return fetchJSON(`${URL.DATAHUB}/oauth/token`, fetchBearerObj).then(
    response => {
      const bearer = response.access_token;

      return fetchGraphQL(`${URL.DATAHUB}/graphql`, operation.text, variables, {
        Authorization: `Bearer ${bearer}`,
      });
    },
  );
}

const getEnvironment = config =>
  new Environment({
    network: Network.create((operation, variables) =>
      fetchQuery(operation, variables, config),
    ),
    store: new Store(new RecordSource()),
  });

const DatahubTileContent = ({ match }, { config }) => {
  const { datahubId } = match.location.query;

  return (
    <QueryRenderer
      query={graphql`
        query DatahubTileContentQuery($datahubId: ID!) {
          pointOfInterest(id: $datahubId) {
            id
            name
            tagList
            dataProvider {
              id
              description
              name
              notice
            }
            addresses {
              id
              city
              street
              zip
            }
            openingHours {
              id
              sortNumber
              dateFrom
              dateTo
              description
              open
              timeFrom
              timeTo
              weekday
            }
            contact {
              id
              webUrls {
                description
                url
              }
              email
              firstName
              lastName
              phone
            }
          }
        }
      `}
      variables={{ datahubId }}
      environment={getEnvironment(config)}
      render={({ error, props }) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error(error);
          // todo: /\bNetworkError\b/.test(error), show different error message?
          return <FormattedMessage id="network-error" />;
        }

        const data = props?.pointOfInterest;
        const loading = !data;

        if (loading) {
          return null;
        }

        return (
          <SidebarContainer
            name={data.name}
            description={data.tagList.join(', ')}
            icon="icon-icon_mapMarker-point"
          >
            <Address addresses={data.addresses} />
            <Contact contact={data.contact} />
            <OpeningHours openingHours={data.openingHours} />
            <DataProvider dataProvider={data.dataProvider} />
          </SidebarContainer>
        );
      }}
    />
  );
};

DatahubTileContent.displayName = 'DatahubTileContent';

DatahubTileContent.propTypes = {
  match: PropTypes.object.isRequired,
  pointOfInterest: PropTypes.object,
};

DatahubTileContent.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default DatahubTileContent;
