import React from 'react';
import Relay from 'react-relay';
import get from 'lodash/get';
import { intlShape, FormattedMessage } from 'react-intl';

// import ExternalLink from './ExternalLink';

function LegAgencyInfo({ leg }, context) {
  const agencyName = get(leg, 'agency.name');
  const agencyUrl = get(leg, 'agency.url');
  const fareUrl = get(leg, 'agency.fareUrl');
  const show = get(context.config, 'agency.show', false);
  if (show && agencyName && (agencyUrl || fareUrl)) {
    // const linkLabel = intl.formatMessage({
    //   id: 'ticket-and-price-info',
    //   defaultMessage: 'Ticket and price information',
    // });
    return (<div className="itinerary-leg-agency">
      <FormattedMessage id="agency" defaultMessage="Operator" />:<br />
      {agencyName}<br />
      {/* TODO: Liikennevirasto will notify when this can be enabled
      <div className="agency-link-container">
        <ExternalLink
          className="itinerary-leg-agency-link"
          name={linkLabel}
          href={fareUrl || agencyUrl}
        />
      </div>
      */}
    </div>);
  }
  return null;
}

LegAgencyInfo.contextTypes = {
  intl: intlShape.isRequired,
  config: React.PropTypes.object.isRequired,
};

LegAgencyInfo.propTypes = {
  leg: React.PropTypes.object,
};

export default Relay.createContainer(LegAgencyInfo, {
  fragments: {
    leg: () =>
      Relay.QL`
      fragment on Leg {
        agency {
          name
          url
          fareUrl
        }
      }
    `,
  },
});
