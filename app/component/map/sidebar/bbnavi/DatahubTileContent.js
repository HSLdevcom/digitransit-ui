import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { Environment, Network, RecordSource, Store } from 'relay-runtime';

import SidebarContainer from '../SidebarContainer';
import Address from './section/Address';
import Contact from './section/Contact';
import OpeningHours from './section/OpeningHours';
import DataProvider from './section/DataProvider';

function fetchQuery(operation, variables, config) {
  const { DATAHUB_O_AUTH, URL } = config;

  const fetchBearerObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: DATAHUB_O_AUTH.CLIENT_ID,
      client_secret: DATAHUB_O_AUTH.CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  };

  return fetch(`${URL.DATAHUB}/oauth/token`, fetchBearerObj)
    .then(response => {
      return response.json();
    })
    .then(response => {
      const bearer = response.access_token;

      return fetch(`${URL.DATAHUB}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
        body: JSON.stringify({ query: operation.text, variables }),
      }).then(response => {
        return response.json();
      });
    });
}

const getEnvironment = config =>
  new Environment({
    network: Network.create((operation, variables) =>
      fetchQuery(operation, variables, config),
    ),
    store: new Store(new RecordSource()),
  });

const DatahubTileContent = ({ match }, { config }) => {
  const { lat, lng, datahubId } = match.location.query;

  return (
    <QueryRenderer
      query={graphql`
        query DatahubTileContentQuery($geoLocationId: ID!) {
          pointOfInterestByGeoLocation(geoLocationId: $geoLocationId) {
            id
            name
            category {
              id
              name
            }
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
              email
              fax
              firstName
              lastName
              phone
            }
          }
        }
      `}
      variables={{ geoLocationId: datahubId }}
      environment={getEnvironment(config)}
      render={({ props }) => {
        const data = props?.pointOfInterestByGeoLocation;
        const loading = !data;

        if (loading) {
          return null;
        }

        return (
          <SidebarContainer
            name={data.name}
            description={data.category.name}
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
  pointOfInterestByGeoLocation: PropTypes.object,
};

DatahubTileContent.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default DatahubTileContent;
